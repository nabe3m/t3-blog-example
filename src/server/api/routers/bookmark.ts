import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const bookmarkRouter = createTRPCRouter({
  // ブックマークをトグル（ブックマーク/ブックマーク解除）
  toggle: protectedProcedure
    .input(z.object({ postId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const { postId } = input;
      const userId = ctx.session.user.id;

      // 既存のブックマークをチェック
      const existingBookmark = await ctx.db.bookmark.findUnique({
        where: {
          postId_userId: {
            postId,
            userId,
          },
        },
      });

      if (existingBookmark) {
        // ブックマークが存在する場合は削除
        await ctx.db.bookmark.delete({
          where: {
            id: existingBookmark.id,
          },
        });
        return { bookmarked: false };
      } else {
        // ブックマークが存在しない場合は作成
        await ctx.db.bookmark.create({
          data: {
            postId,
            userId,
          },
        });
        return { bookmarked: true };
      }
    }),

  // 記事のブックマーク数を取得
  getCount: protectedProcedure
    .input(z.object({ postId: z.number() }))
    .query(async ({ ctx, input }) => {
      const count = await ctx.db.bookmark.count({
        where: {
          postId: input.postId,
        },
      });
      return count;
    }),

  // ユーザーがブックマークしているかチェック
  isBookmarked: protectedProcedure
    .input(z.object({ postId: z.number() }))
    .query(async ({ ctx, input }) => {
      const bookmark = await ctx.db.bookmark.findUnique({
        where: {
          postId_userId: {
            postId: input.postId,
            userId: ctx.session.user.id,
          },
        },
      });
      return !!bookmark;
    }),

  // ユーザーのブックマーク一覧を取得
  getUserBookmarks: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(20),
        cursor: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { limit, cursor } = input;

      const bookmarks = await ctx.db.bookmark.findMany({
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
      if (bookmarks.length > limit) {
        const nextItem = bookmarks.pop();
        nextCursor = nextItem!.id.toString();
      }

      return {
        bookmarks,
        nextCursor,
      };
    }),
}); 