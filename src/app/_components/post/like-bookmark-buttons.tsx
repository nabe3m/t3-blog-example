"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { api } from "~/trpc/react";
import { useNotifications } from "~/app/_components/admin/notification-context";

interface LikeBookmarkButtonsProps {
	postId: number;
	initialLikeCount?: number;
	initialBookmarkCount?: number;
	initialIsLiked?: boolean;
	initialIsBookmarked?: boolean;
}

export function LikeBookmarkButtons({
	postId,
	initialLikeCount = 0,
	initialBookmarkCount = 0,
	initialIsLiked = false,
	initialIsBookmarked = false,
}: LikeBookmarkButtonsProps) {
	const { data: session } = useSession();
	const { addNotification } = useNotifications();
	const utils = api.useUtils();

	// 堅牢な初期化
	const [optimisticLikeCount, setOptimisticLikeCount] = useState(
		typeof initialLikeCount === 'number' ? initialLikeCount : 0
	);
	const [optimisticBookmarkCount, setOptimisticBookmarkCount] = useState(
		typeof initialBookmarkCount === 'number' ? initialBookmarkCount : 0
	);
	const [optimisticIsLiked, setOptimisticIsLiked] = useState(Boolean(initialIsLiked));
	const [optimisticIsBookmarked, setOptimisticIsBookmarked] = useState(Boolean(initialIsBookmarked));

	// propsが変更された際に状態を更新
	useEffect(() => {
		setOptimisticLikeCount(typeof initialLikeCount === 'number' ? initialLikeCount : 0);
		setOptimisticBookmarkCount(typeof initialBookmarkCount === 'number' ? initialBookmarkCount : 0);
		setOptimisticIsLiked(Boolean(initialIsLiked));
		setOptimisticIsBookmarked(Boolean(initialIsBookmarked));
	}, [initialLikeCount, initialBookmarkCount, initialIsLiked, initialIsBookmarked]);

	// いいね機能
	const likeMutation = api.like.toggle.useMutation({
		onMutate: async () => {
			// 楽観的更新
			const currentLiked = optimisticIsLiked;
			const currentCount = optimisticLikeCount;
			
			setOptimisticIsLiked(!currentLiked);
			setOptimisticLikeCount(currentLiked ? currentCount - 1 : currentCount + 1);
		},
		onSuccess: (data) => {
			// キャッシュを更新
			utils.like.invalidate();
			utils.post.invalidate();
		},
		onError: () => {
			// エラー時は元に戻す
			setOptimisticIsLiked(!optimisticIsLiked);
			setOptimisticLikeCount(optimisticIsLiked ? optimisticLikeCount + 1 : optimisticLikeCount - 1);
			
			addNotification({
				type: "error",
				title: "いいねの更新に失敗しました",
			});
		},
	});

	// ブックマーク機能
	const bookmarkMutation = api.bookmark.toggle.useMutation({
		onMutate: async () => {
			// 楽観的更新
			const currentBookmarked = optimisticIsBookmarked;
			const currentCount = optimisticBookmarkCount;
			
			setOptimisticIsBookmarked(!currentBookmarked);
			setOptimisticBookmarkCount(currentBookmarked ? currentCount - 1 : currentCount + 1);
		},
		onSuccess: (data) => {
			// キャッシュを更新
			utils.bookmark.invalidate();
			utils.post.invalidate();
		},
		onError: () => {
			// エラー時は元に戻す
			setOptimisticIsBookmarked(!optimisticIsBookmarked);
			setOptimisticBookmarkCount(optimisticIsBookmarked ? optimisticBookmarkCount + 1 : optimisticBookmarkCount - 1);
			
			addNotification({
				type: "error",
				title: "ブックマークの更新に失敗しました",
			});
		},
	});

	const handleLike = () => {
		if (!session) {
			addNotification({
				type: "error",
				title: "いいねするにはログインが必要です",
			});
			return;
		}
		likeMutation.mutate({ postId });
	};

	const handleBookmark = () => {
		if (!session) {
			addNotification({
				type: "error",
				title: "ブックマークするにはログインが必要です",
			});
			return;
		}
		bookmarkMutation.mutate({ postId });
	};

	return (
		<div className="flex items-center gap-4">
			{/* いいねボタン */}
			<button
				onClick={handleLike}
				disabled={likeMutation.isPending}
				className={`group flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${
					optimisticIsLiked
						? "text-red-600 bg-red-50 hover:bg-red-100"
						: "text-gray-600 hover:text-red-600 hover:bg-gray-50"
				} disabled:opacity-50 disabled:cursor-not-allowed`}
			>
				<svg
					className={`w-4 h-4 transition-colors ${
						optimisticIsLiked ? "fill-red-500 text-red-500" : "text-current"
					}`}
					fill={optimisticIsLiked ? "currentColor" : "none"}
					stroke="currentColor"
					viewBox="0 0 24 24"
					strokeWidth={1.5}
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
					/>
				</svg>
				<span className="text-sm">{optimisticLikeCount}</span>
			</button>

			{/* ブックマークボタン */}
			<button
				onClick={handleBookmark}
				disabled={bookmarkMutation.isPending}
				className={`group flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${
					optimisticIsBookmarked
						? "text-blue-600 bg-blue-50 hover:bg-blue-100"
						: "text-gray-600 hover:text-blue-600 hover:bg-gray-50"
				} disabled:opacity-50 disabled:cursor-not-allowed`}
			>
				<svg
					className={`w-4 h-4 transition-colors ${
						optimisticIsBookmarked ? "fill-blue-500 text-blue-500" : "text-current"
					}`}
					fill={optimisticIsBookmarked ? "currentColor" : "none"}
					stroke="currentColor"
					viewBox="0 0 24 24"
					strokeWidth={1.5}
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z"
					/>
				</svg>
				<span className="text-sm">{optimisticBookmarkCount}</span>
			</button>
		</div>
	);
} 