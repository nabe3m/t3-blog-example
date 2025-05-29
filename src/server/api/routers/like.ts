import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const likeRouter = createTRPCRouter({
  // いいねをトグル（いいね/いいね解除）
  toggle: protectedProcedure
    .input(z.object({ postId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const { postId } = input;
      const userId = ctx.session.user.id;

      // 既存のいいねをチェック
      const existingLike = await ctx.db.like.findUnique({
        where: {
          postId_userId: {
            postId,
            userId,
          },
        },
      });

      if (existingLike) {
        // いいねが存在する場合は削除
        await ctx.db.like.delete({
          where: {
            id: existingLike.id,
          },
        });
        return { liked: false };
      } else {
        // いいねが存在しない場合は作成
        await ctx.db.like.create({
          data: {
            postId,
            userId,
          },
        });
        return { liked: true };
      }
    }),

  // 記事のいいね数を取得
  getCount: protectedProcedure
    .input(z.object({ postId: z.number() }))
    .query(async ({ ctx, input }) => {
      const count = await ctx.db.like.count({
        where: {
          postId: input.postId,
        },
      });
      return count;
    }),

  // ユーザーがいいねしているかチェック
  isLiked: protectedProcedure
    .input(z.object({ postId: z.number() }))
    .query(async ({ ctx, input }) => {
      const like = await ctx.db.like.findUnique({
        where: {
          postId_userId: {
            postId: input.postId,
            userId: ctx.session.user.id,
          },
        },
      });
      return !!like;
    }),

  // ユーザーのいいね一覧を取得
  getUserLikes: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(20),
        cursor: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { limit, cursor } = input;

      const likes = await ctx.db.like.findMany({
        where: {
          userId: ctx.session.user.id,
        },
        include: {
          post: {
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
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: limit + 1,
        cursor: cursor ? { id: parseInt(cursor) } : undefined,
      });

      let nextCursor: string | undefined;
      if (likes.length > limit) {
        const nextItem = likes.pop();
        nextCursor = nextItem!.id.toString();
      }

      return {
        likes,
        nextCursor,
      };
    }),
}); 