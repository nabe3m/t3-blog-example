import { z } from "zod";
import { TRPCError } from "@trpc/server";

import {
	createTRPCRouter,
	protectedProcedure,
	publicProcedure,
} from "~/server/api/trpc";

const createCategorySchema = z.object({
	name: z.string().min(1, "カテゴリ名は必須です"),
	slug: z.string().min(1, "スラッグは必須です"),
	description: z.string().optional(),
});

const updateCategorySchema = z.object({
	id: z.number(),
	name: z.string().min(1).optional(),
	slug: z.string().min(1).optional(),
	description: z.string().optional(),
});

export const categoryRouter = createTRPCRouter({
	// 全カテゴリ取得（公開）
	getAll: publicProcedure.query(async ({ ctx }) => {
		return ctx.db.category.findMany({
			include: {
				_count: {
					select: {
						posts: {
							where: {
								post: {
									published: true,
								},
							},
						},
					},
				},
			},
			orderBy: { name: "asc" },
		});
	}),

	// IDでカテゴリ取得
	getById: publicProcedure
		.input(z.object({ id: z.number() }))
		.query(async ({ ctx, input }) => {
			const category = await ctx.db.category.findUnique({
				where: { id: input.id },
				include: {
					_count: {
						select: {
							posts: {
								where: {
									post: {
										published: true,
									},
								},
							},
						},
					},
				},
			});

			if (!category) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "カテゴリが見つかりません",
				});
			}

			return category;
		}),

	// スラッグでカテゴリ取得
	getBySlug: publicProcedure
		.input(z.object({ slug: z.string() }))
		.query(async ({ ctx, input }) => {
			const category = await ctx.db.category.findUnique({
				where: { slug: input.slug },
				include: {
					_count: {
						select: {
							posts: {
								where: {
									post: {
										published: true,
									},
								},
							},
						},
					},
				},
			});

			if (!category) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "カテゴリが見つかりません",
				});
			}

			return category;
		}),

	// 管理者用: 全カテゴリ取得
	getAllAdmin: protectedProcedure.query(async ({ ctx }) => {
		return ctx.db.category.findMany({
			include: {
				_count: {
					select: { posts: true },
				},
			},
			orderBy: { createdAt: "desc" },
		});
	}),

	// カテゴリ作成
	create: protectedProcedure
		.input(createCategorySchema)
		.mutation(async ({ ctx, input }) => {
			// スラッグの重複チェック
			const existingCategory = await ctx.db.category.findUnique({
				where: { slug: input.slug },
			});

			if (existingCategory) {
				throw new TRPCError({
					code: "CONFLICT",
					message: "このスラッグは既に使用されています",
				});
			}

			// 名前の重複チェック
			const existingName = await ctx.db.category.findUnique({
				where: { name: input.name },
			});

			if (existingName) {
				throw new TRPCError({
					code: "CONFLICT",
					message: "このカテゴリ名は既に使用されています",
				});
			}

			return ctx.db.category.create({
				data: input,
			});
		}),

	// カテゴリ更新
	update: protectedProcedure
		.input(updateCategorySchema)
		.mutation(async ({ ctx, input }) => {
			const { id, ...updateData } = input;

			// スラッグの重複チェック（自分以外）
			if (updateData.slug) {
				const existingCategory = await ctx.db.category.findFirst({
					where: {
						slug: updateData.slug,
						id: { not: id },
					},
				});

				if (existingCategory) {
					throw new TRPCError({
						code: "CONFLICT",
						message: "このスラッグは既に使用されています",
					});
				}
			}

			// 名前の重複チェック（自分以外）
			if (updateData.name) {
				const existingName = await ctx.db.category.findFirst({
					where: {
						name: updateData.name,
						id: { not: id },
					},
				});

				if (existingName) {
					throw new TRPCError({
						code: "CONFLICT",
						message: "このカテゴリ名は既に使用されています",
					});
				}
			}

			return ctx.db.category.update({
				where: { id },
				data: updateData,
			});
		}),

	// カテゴリ削除
	delete: protectedProcedure
		.input(z.object({ id: z.number() }))
		.mutation(async ({ ctx, input }) => {
			// PostCategoryテーブルのエントリが自動的にCascade削除される
			return ctx.db.category.delete({
				where: { id: input.id },
			});
		}),
}); 