import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";

export const userRouter = createTRPCRouter({
	// ユーザー情報取得（公開情報のみ）
	getById: publicProcedure
		.input(z.object({ userId: z.string() }))
		.query(async ({ ctx, input }) => {
			try {
				const user = await ctx.db.user.findUnique({
					where: { id: input.userId },
				});

				if (!user) {
					throw new TRPCError({
						code: "NOT_FOUND",
						message: "ユーザーが見つかりません",
					});
				}

				// 公開情報のみ返す
				return {
					id: user.id,
					name: user.name,
					image: user.image,
					bio: (user as any).bio || null,
					website: (user as any).website || null,
					twitter: (user as any).twitter || null,
					github: (user as any).github || null,
				};
			} catch (error) {
				console.error("User get error:", error);
				if (error instanceof TRPCError) {
					throw error;
				}
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "ユーザー情報の取得に失敗しました",
					cause: error,
				});
			}
		}),

	// ユーザーの公開記事一覧取得
	getPosts: publicProcedure
		.input(
			z.object({
				userId: z.string(),
				limit: z.number().min(1).max(100).default(10),
				cursor: z.string().nullish(),
			})
		)
		.query(async ({ ctx, input }) => {
			try {
				const posts = await ctx.db.post.findMany({
					where: {
						createdById: input.userId,
						published: true,
					},
					take: input.limit + 1,
					cursor: input.cursor ? { id: parseInt(input.cursor) } : undefined,
					orderBy: {
						publishedAt: "desc",
					},
					include: {
						createdBy: {
							select: {
								id: true,
								name: true,
								image: true,
							},
						},
						categories: {
							include: {
								category: true,
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

				let nextCursor: typeof input.cursor | undefined = undefined;
				if (posts.length > input.limit) {
					const nextItem = posts.pop();
					nextCursor = nextItem!.id.toString();
				}

				return {
					posts,
					nextCursor,
				};
			} catch (error) {
				console.error("User posts get error:", error);
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "ユーザーの記事一覧の取得に失敗しました",
					cause: error,
				});
			}
		}),

	// ユーザーの記事統計
	getStats: publicProcedure
		.input(z.object({ userId: z.string() }))
		.query(async ({ ctx, input }) => {
			try {
				const [totalPosts, totalLikes, totalBookmarks] = await Promise.all([
					ctx.db.post.count({
						where: {
							createdById: input.userId,
							published: true,
						},
					}),
					ctx.db.like.count({
						where: {
							post: {
								createdById: input.userId,
								published: true,
							},
						},
					}),
					ctx.db.bookmark.count({
						where: {
							post: {
								createdById: input.userId,
								published: true,
							},
						},
					}),
				]);

				return {
					totalPosts,
					totalLikes,
					totalBookmarks,
				};
			} catch (error) {
				console.error("User stats get error:", error);
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "ユーザー統計の取得に失敗しました",
					cause: error,
				});
			}
		}),
}); 