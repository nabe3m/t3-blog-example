import { z } from "zod";
import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";

import {
	createTRPCRouter,
	protectedProcedure,
	publicProcedure,
} from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";

// 絵文字かどうかを判定する関数
const isEmoji = (str: string) => {
	const emojiRegex = /^[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]$/u;
	return emojiRegex.test(str);
};

// featuredImage用のカスタムバリデーション
const featuredImageSchema = z.string().refine((val) => {
	if (val === "") return true; // 空文字列は許可
	if (isEmoji(val)) return true; // 絵文字は許可
	try {
		new URL(val); // URLとして有効かチェック
		return true;
	} catch {
		return false;
	}
}, {
	message: "有効なURLまたは絵文字を入力してください"
}).optional();

const createPostSchema = z.object({
	title: z.string().min(1, "タイトルは必須です"),
	content: z.string().default(""),
	excerpt: z.string().optional(),
	featuredImage: featuredImageSchema,
	categoryIds: z.array(z.number()).optional(),
	published: z.boolean().default(false),
});

const updatePostSchema = z.object({
	id: z.number(),
	title: z.string().min(1).optional(),
	content: z.string().optional(),
	excerpt: z.string().optional(),
	featuredImage: featuredImageSchema,
	categoryIds: z.array(z.number()).optional(),
	published: z.boolean().optional(),
});

export const postRouter = createTRPCRouter({
	// 公開記事の一覧取得
	getPublished: publicProcedure
		.input(
			z.object({
				limit: z.number().min(1).max(100).default(10),
				cursor: z.number().optional(),
				categoryId: z.number().optional(),
			})
		)
		.query(async ({ ctx, input }) => {
			const { limit, cursor, categoryId } = input;
			
			const posts = await ctx.db.post.findMany({
				take: limit + 1,
				cursor: cursor ? { id: cursor } : undefined,
				where: {
					published: true,
					publishedAt: { lte: new Date() },
					...(categoryId && {
						categories: {
							some: {
								categoryId: categoryId
							}
						}
					}),
				},
				include: {
					categories: {
						include: {
							category: true
						}
					},
					createdBy: {
						select: { 
							id: true,
							name: true, 
							image: true 
						},
					},
				},
				orderBy: { publishedAt: "desc" },
			});

			let nextCursor: typeof cursor | undefined = undefined;
			if (posts.length > limit) {
				const nextItem = posts.pop();
				nextCursor = nextItem!.id;
			}

			return {
				posts,
				nextCursor,
			};
		}),

	// スラッグで記事取得
	getBySlug: publicProcedure
		.input(z.object({ slug: z.string() }))
		.query(async ({ ctx, input }) => {
			const post = await ctx.db.post.findUnique({
				where: { slug: input.slug },
				include: {
					categories: {
						include: {
							category: true
						}
					},
					createdBy: {
						select: { 
							id: true,
							name: true, 
							image: true 
						},
					},
					_count: {
						select: {
							likes: true,
							bookmarks: true,
						},
					},
				},
			});

			if (!post || (!post.published && ctx.session?.user?.role !== "ADMIN")) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "記事が見つかりません",
				});
			}

			// ログイン中のユーザーがいいね・ブックマークしているかチェック
			let isLikedByUser = false;
			let isBookmarkedByUser = false;
			
			if (ctx.session?.user?.id) {
				const [likeCheck, bookmarkCheck] = await Promise.all([
					ctx.db.like.findUnique({
						where: {
							postId_userId: {
								postId: post.id,
								userId: ctx.session.user.id,
							},
						},
					}),
					ctx.db.bookmark.findUnique({
						where: {
							postId_userId: {
								postId: post.id,
								userId: ctx.session.user.id,
							},
						},
					}),
				]);
				
				isLikedByUser = !!likeCheck;
				isBookmarkedByUser = !!bookmarkCheck;
			}

			return {
				...post,
				isLikedByUser,
				isBookmarkedByUser,
			};
		}),

	// 管理者用: 全記事取得
	getAll: protectedProcedure
		.input(
			z.object({
				limit: z.number().min(1).max(100).default(10),
				cursor: z.number().optional(),
				published: z.boolean().optional(),
				createdBy: z.string().optional(),
			})
		)
		.query(async ({ ctx, input }) => {
			const { limit, cursor, published, createdBy } = input;
			
			const posts = await ctx.db.post.findMany({
				take: limit + 1,
				cursor: cursor ? { id: cursor } : undefined,
				where: {
					...(published !== undefined && { published }),
					...(createdBy && { createdById: createdBy }),
				},
				include: {
					categories: {
						include: {
							category: true
						}
					},
					createdBy: {
						select: { 
							id: true,
							name: true, 
							image: true 
						},
					},
				},
				orderBy: { createdAt: "desc" },
			});

			let nextCursor: typeof cursor | undefined = undefined;
			if (posts.length > limit) {
				const nextItem = posts.pop();
				nextCursor = nextItem!.id;
			}

			return {
				posts,
				nextCursor,
			};
		}),

	// IDで記事取得（管理者用）
	getById: protectedProcedure
		.input(z.object({ id: z.number() }))
		.query(async ({ ctx, input }) => {
			const post = await ctx.db.post.findUnique({
				where: { id: input.id },
				include: {
					categories: {
						include: {
							category: true
						}
					},
					createdBy: {
						select: { 
							id: true,
							name: true, 
							image: true 
						},
					},
				},
			});

			if (!post) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "記事が見つかりません",
				});
			}

			return post;
		}),

	// 記事作成
	create: protectedProcedure
		.input(createPostSchema)
		.mutation(async ({ ctx, input }) => {
			// featuredImageが空文字列の場合はnullにする
			const featuredImage = input.featuredImage === "" ? null : input.featuredImage;

			// UUIDベースのスラッグを生成
			const slug = randomUUID();

			const post = await ctx.db.post.create({
				data: {
					title: input.title,
					slug: slug,
					content: input.content,
					excerpt: input.excerpt,
					featuredImage,
					published: input.published,
					publishedAt: input.published ? new Date() : null,
					createdBy: { connect: { id: ctx.session.user.id } },
					...(input.categoryIds && input.categoryIds.length > 0 && {
						categories: {
							create: input.categoryIds.map(categoryId => ({
								category: { connect: { id: categoryId } }
							}))
						}
					}),
				},
				include: {
					categories: {
						include: {
							category: true
						}
					},
					createdBy: {
						select: { 
							id: true,
							name: true, 
							image: true 
						},
					},
				},
			});

			// ISRキャッシュを無効化（公開された記事の場合）
			if (input.published) {
				revalidatePath("/"); // ホームページ
				revalidatePath("/categories"); // カテゴリ一覧
				
				// カテゴリページも無効化
				if (post.categories && post.categories.length > 0) {
					post.categories.forEach(postCategory => {
						revalidatePath(`/categories/${postCategory.category.slug}`);
					});
				}
			}

			return post;
		}),

	// 記事更新
	update: protectedProcedure
		.input(updatePostSchema)
		.mutation(async ({ ctx, input }) => {
			const { id, ...updateData } = input;

			// 記事の存在と所有権チェック
			const currentPost = await ctx.db.post.findUnique({
				where: { id },
			});

			if (!currentPost) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "記事が見つかりません",
				});
			}

			if (currentPost.createdById !== ctx.session.user.id) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "この記事を編集する権限がありません",
				});
			}

			// featuredImageが空文字列の場合はnullにする
			const featuredImage = updateData.featuredImage === "" ? null : updateData.featuredImage;

			// 公開状態が変更された場合の処理
			let publishedAt = currentPost.publishedAt;
			if (updateData.published !== undefined) {
				if (updateData.published && !currentPost.published) {
					publishedAt = new Date();
				} else if (!updateData.published) {
					publishedAt = null;
				}
			}

			// カテゴリの更新処理
			if (updateData.categoryIds !== undefined) {
				// 既存のカテゴリ関連を削除
				await ctx.db.postCategory.deleteMany({
					where: { postId: id }
				});
			}

			const post = await ctx.db.post.update({
				where: { id },
				data: {
					...(updateData.title && { title: updateData.title }),
					...(updateData.content !== undefined && { content: updateData.content }),
					...(updateData.excerpt !== undefined && { excerpt: updateData.excerpt }),
					...(updateData.featuredImage !== undefined && { featuredImage }),
					...(updateData.published !== undefined && { published: updateData.published }),
					publishedAt,
					...(updateData.categoryIds !== undefined && updateData.categoryIds.length > 0 && {
						categories: {
							create: updateData.categoryIds.map(categoryId => ({
								category: { connect: { id: categoryId } }
							}))
						}
					}),
				},
				include: {
					categories: {
						include: {
							category: true
						}
					},
					createdBy: {
						select: { 
							id: true,
							name: true, 
							image: true 
						},
					},
				},
			});

			// ISRキャッシュを無効化
			revalidatePath("/"); // ホームページ
			revalidatePath(`/posts/${currentPost.slug}`); // 記事ページ
			revalidatePath("/categories"); // カテゴリ一覧
			
			// カテゴリページも無効化
			if (post.categories && post.categories.length > 0) {
				post.categories.forEach(postCategory => {
					revalidatePath(`/categories/${postCategory.category.slug}`);
				});
			}

			return post;
		}),

	// 記事削除
	delete: protectedProcedure
		.input(z.object({ id: z.number() }))
		.mutation(async ({ ctx, input }) => {
			// 記事の存在と所有権チェック
			const currentPost = await ctx.db.post.findUnique({
				where: { id: input.id },
				include: {
					categories: {
						include: {
							category: true
						}
					}
				}
			});

			if (!currentPost) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "記事が見つかりません",
				});
			}

			if (currentPost.createdById !== ctx.session.user.id) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "この記事を削除する権限がありません",
				});
			}

			const result = await ctx.db.post.delete({
				where: { id: input.id },
			});

			// ISRキャッシュを無効化
			revalidatePath("/"); // ホームページ
			revalidatePath(`/posts/${currentPost.slug}`); // 記事ページ
			revalidatePath("/categories"); // カテゴリ一覧
			
			// カテゴリページも無効化
			if (currentPost.categories && currentPost.categories.length > 0) {
				currentPost.categories.forEach(postCategory => {
					revalidatePath(`/categories/${postCategory.category.slug}`);
				});
			}

			return result;
		}),
});
