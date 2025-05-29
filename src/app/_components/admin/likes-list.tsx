"use client";

import { useState } from "react";
import Link from "next/link";
import { api } from "~/trpc/react";

export function LikesList() {
	const [cursor, setCursor] = useState<string | undefined>();
	const { 
		data: likesData, 
		isLoading, 
		error,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage 
	} = api.like.getUserLikes.useInfiniteQuery(
		{ limit: 10 },
		{
			getNextPageParam: (lastPage) => lastPage.nextCursor,
		}
	);

	if (isLoading) {
		return (
			<div className="flex items-center justify-center p-8">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="bg-red-50 border border-red-200 rounded-md p-4">
				<p className="text-red-600">いいね一覧の読み込みに失敗しました</p>
			</div>
		);
	}

	const allLikes = likesData?.pages.flatMap(page => page.likes) ?? [];

	if (allLikes.length === 0) {
		return (
			<div className="text-center py-8">
				<p className="text-gray-500">まだいいねした記事はありません</p>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div className="grid gap-4">
				{allLikes.map((like) => (
					<Link key={like.id} href={`/posts/${like.post.slug}`} className="group">
						<div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer">
							<div className="flex items-start justify-between">
								<div className="flex-1">
									<h3 className="text-lg font-medium text-gray-900">
										{like.post.title}
									</h3>
									{like.post.excerpt && (
										<p className="text-gray-600 mt-1 line-clamp-2">
											{like.post.excerpt}
										</p>
									)}
									
									<div className="flex items-center mt-2 text-sm text-gray-500 space-x-4">
										<span>
											by {like.post.createdBy?.name || "匿名"}
										</span>
										<span>
											{new Date(like.createdAt).toLocaleDateString('ja-JP')}にいいね
										</span>
										<div className="flex items-center space-x-3">
											<span className="flex items-center">
												<svg className="w-4 h-4 mr-1 text-red-500" fill="currentColor" viewBox="0 0 24 24">
													<path d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"/>
												</svg>
												{like.post._count?.likes || 0}
											</span>
											<span className="flex items-center">
												<svg className="w-4 h-4 mr-1 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
													<path d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z"/>
												</svg>
												{like.post._count?.bookmarks || 0}
											</span>
										</div>
									</div>

									{like.post.categories && like.post.categories.length > 0 && (
										<div className="flex flex-wrap gap-2 mt-2">
											{like.post.categories.map((postCategory: any) => (
												<span
													key={postCategory.category.id}
													className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
													onClick={(e) => {
														e.preventDefault();
														e.stopPropagation();
														window.location.href = `/categories/${postCategory.category.slug}`;
													}}
												>
													{postCategory.category.name}
												</span>
											))}
										</div>
									)}
								</div>
								
								{/* 記事へのリンクを示すアイコン */}
								<div className="flex-shrink-0 ml-4">
									<svg 
										className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" 
										fill="none" 
										stroke="currentColor" 
										viewBox="0 0 24 24"
									>
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
									</svg>
								</div>
							</div>
						</div>
					</Link>
				))}
			</div>

			{hasNextPage && (
				<div className="text-center">
					<button
						onClick={() => fetchNextPage()}
						disabled={isFetchingNextPage}
						className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
					>
						{isFetchingNextPage ? "読み込み中..." : "さらに読み込む"}
					</button>
				</div>
			)}
		</div>
	);
} 