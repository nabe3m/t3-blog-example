"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { LikeBookmarkButtons } from "~/app/_components/post/like-bookmark-buttons";
import { ShareButtons } from "~/app/_components/post/share-buttons";
import { NotificationProvider } from "~/app/_components/admin/notification-context";

interface PostPageClientProps {
	children?: React.ReactNode;
	article?: any;
}

// ヘッダーナビゲーション用の分離されたコンポーネント
export function HeaderNavigation() {
	const { data: session } = useSession();

	return (
		<>
			{session?.user && (
				<Link 
					href="/admin" 
					className="rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
				>
					管理画面
				</Link>
			)}
			<Link
				href={session ? "/api/auth/signout" : "/api/auth/signin"}
				className="rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
			>
				{session ? "ログアウト" : "ログイン"}
			</Link>
		</>
	);
}

// いいね・ブックマークボタン用のコンポーネント
export function PostActions({ article }: { article: any }) {
	// 現在のURLを取得
	const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

	return (
		<div className="border-y border-gray-200 py-4 mb-8">
			<div className="flex items-center justify-between">
				<LikeBookmarkButtons 
					postId={article.id}
					initialLikeCount={article._count?.likes || 0}
					initialBookmarkCount={article._count?.bookmarks || 0}
					initialIsLiked={article.isLikedByUser || false}
					initialIsBookmarked={article.isBookmarkedByUser || false}
				/>
				<ShareButtons title={article.title} url={currentUrl} />
			</div>
		</div>
	);
}

export function PostPageClient({ children, article }: PostPageClientProps) {
	// メインのラッパーコンポーネント
	if (article) {
		return (
			<NotificationProvider>
				<PostActions article={article} />
			</NotificationProvider>
		);
	}

	return (
		<NotificationProvider>
			{children}
		</NotificationProvider>
	);
} 