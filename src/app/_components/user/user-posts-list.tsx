"use client";

import Link from "next/link";
import { api } from "~/trpc/react";

interface UserPostsListProps {
	userId: string;
}

export function UserPostsList({ userId }: UserPostsListProps) {
	const {
		data: postsData,
		isLoading,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
	} = api.user.getPosts.useInfiniteQuery(
		{ userId, limit: 10 },
		{
			getNextPageParam: (lastPage) => lastPage.nextCursor,
			enabled: !!userId && userId.length > 0,
		}
	);

	// 絵文字かどうかを判定
	const isEmoji = (str: string) => {
		const emojiRegex = /^[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]$/u;
		return emojiRegex.test(str);
	};

	// userIdが無効な場合
	if (!userId || userId.length === 0) {
		return (
			<div className="text-center py-12">
				<svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
				</svg>
				<h3 className="mt-4 text-lg font-medium text-gray-900">無効なユーザーID</h3>
				<p className="mt-2 text-gray-500">ユーザーIDが指定されていません。</p>
			</div>
		);
	}

	if (isLoading) {
		return (
			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				{[...Array(6)].map((_, i) => (
					<div key={i} className="bg-white rounded-lg shadow p-4 animate-pulse">
						<div className="h-32 bg-gray-200 rounded w-full mb-3" />
						<div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
						<div className="h-3 bg-gray-200 rounded w-1/2 mb-2" />
						<div className="h-3 bg-gray-200 rounded w-full mb-1" />
						<div className="h-3 bg-gray-200 rounded w-2/3" />
					</div>
				))}
			</div>
		);
	}

	const posts = postsData?.pages.flatMap((page) => page.posts) ?? [];

	if (posts.length === 0) {
		return (
			<div className="text-center py-12">
				<svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
				</svg>
				<h3 className="mt-4 text-lg font-medium text-gray-900">記事がありません</h3>
				<p className="mt-2 text-gray-500">このユーザーはまだ記事を投稿していません。</p>
			</div>
		);
	}

	return (
		<div>
			{/* 記事一覧グリッド */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
				{posts.map((post) => (
					<article key={post.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
						<Link href={`/posts/${post.slug}`} className="block">
							{/* アイキャッチ画像 */}
							{post.featuredImage && (
								<div className="mb-3">
									{isEmoji(post.featuredImage) ? (
										// 絵文字の場合
										<div className="w-full h-32 flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 rounded-t-lg">
											<span className="text-5xl">{post.featuredImage}</span>
										</div>
									) : (
										// 通常の画像URLの場合
										<img 
											src={post.featuredImage} 
											alt={post.title}
											className="w-full h-32 object-cover rounded-t-lg"
										/>
									)}
								</div>
							)}
							
							<div className="p-4">
								{/* カテゴリタグ */}
								{post.categories && post.categories.length > 0 && (
									<div className="flex flex-wrap gap-2 mb-3">
										{post.categories.map((postCategory) => (
											<span
												key={postCategory.category.id}
												className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
											>
												{postCategory.category.name}
											</span>
										))}
									</div>
								)}

								{/* メタ情報 */}
								<div className="flex items-center text-xs text-gray-500 mb-2">
									<time dateTime={post.publishedAt?.toISOString()}>
										{(post.publishedAt || post.createdAt)?.toLocaleDateString('ja-JP')}
									</time>
									<span className="mx-1">•</span>
									<span>{post._count.likes} いいね</span>
									<span className="mx-1">•</span>
									<span>{post._count.bookmarks} ブックマーク</span>
								</div>
								
								{/* タイトル */}
								<h2 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 hover:text-blue-600 transition-colors">
									{post.title}
								</h2>
								
								{/* 抜粋 */}
								{post.excerpt && (
									<p className="text-gray-600 text-sm mb-3 line-clamp-2">
										{post.excerpt}
									</p>
								)}
								
								<div className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium text-sm">
									続きを読む
									<svg className="ml-1 w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
									</svg>
								</div>
							</div>
						</Link>
					</article>
				))}
			</div>

			{/* もっと読み込むボタン */}
			{hasNextPage && (
				<div className="text-center">
					<button
						onClick={() => fetchNextPage()}
						disabled={isFetchingNextPage}
						className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
					>
						{isFetchingNextPage ? (
							<div className="flex items-center">
								<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
								読み込み中...
							</div>
						) : (
							"もっと読み込む"
						)}
					</button>
				</div>
			)}
		</div>
	);
} 