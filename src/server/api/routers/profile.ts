import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";

export const profileRouter = createTRPCRouter({
	// 現在のユーザープロフィール取得
	get: protectedProcedure.query(async ({ ctx }) => {
		try {
			const user = await ctx.db.user.findUnique({
				where: { id: ctx.session.user.id },
			});

			if (!user) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "ユーザーが見つかりません",
				});
			}

			// 安全にユーザー情報を返す
			return {
				id: user.id,
				name: user.name,
				email: user.email,
				image: user.image,
				bio: (user as any).bio || null,
				website: (user as any).website || null,
				twitter: (user as any).twitter || null,
				github: (user as any).github || null,
				createdAt: new Date(),
			};
		} catch (error) {
			console.error("Profile get error:", error);
			if (error instanceof TRPCError) {
				throw error;
			}
			throw new TRPCError({
				code: "INTERNAL_SERVER_ERROR",
				message: "プロフィールの取得に失敗しました",
				cause: error,
			});
		}
	}),

	// プロフィール更新
	update: protectedProcedure
		.input(
			z.object({
				name: z.string().min(1, "名前は必須です").max(100, "名前は100文字以内で入力してください"),
				bio: z.string().max(500, "自己紹介は500文字以内で入力してください").optional(),
				website: z.string().url("有効なURLを入力してください").optional().or(z.literal("")),
				twitter: z.string().max(50, "Xユーザー名は50文字以内で入力してください").optional(),
				github: z.string().max(50, "GitHubユーザー名は50文字以内で入力してください").optional(),
			})
		)
		.mutation(async ({ ctx, input }) => {
			try {
				// 生のSQLまたは安全な更新方法を使用
				const updatedUser = await ctx.db.user.update({
					where: { id: ctx.session.user.id },
					data: {
						name: input.name,
						...(input.bio !== undefined && { bio: input.bio || null } as any),
						...(input.website !== undefined && { website: input.website || null } as any),
						...(input.twitter !== undefined && { twitter: input.twitter || null } as any),
						...(input.github !== undefined && { github: input.github || null } as any),
					},
				});

				return {
					id: updatedUser.id,
					name: updatedUser.name,
					email: updatedUser.email,
					image: updatedUser.image,
					bio: (updatedUser as any).bio || null,
					website: (updatedUser as any).website || null,
					twitter: (updatedUser as any).twitter || null,
					github: (updatedUser as any).github || null,
				};
			} catch (error) {
				console.error("Profile update error:", error);
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "プロフィールの更新に失敗しました",
					cause: error,
				});
			}
		}),
}); 