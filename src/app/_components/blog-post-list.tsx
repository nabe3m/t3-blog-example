"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useRouter } from "next/navigation";
import { api } from "~/trpc/react";

function BlogPostListContent() {
	const router = useRouter();
	const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, error } = 
		api.post.getPublished.useInfiniteQuery(
			{ limit: 10 },
			{
				getNextPageParam: (lastPage) => lastPage.nextCursor,
			}
		);

	if (isLoading) {
		return <BlogPostListSkeleton />;
	}

	if (error) {
		return (
			<div className="bg-red-50 border border-red-200 rounded-lg p-4">
				<p className="text-red-600">記事の読み込み中にエラーが発生しました。</p>
			</div>
		);
	}

	const posts = data?.pages.flatMap((page) => page.posts) ?? [];

	if (posts.length === 0) {
		return (
			<div className="bg-white rounded-lg shadow p-8 text-center">
				<p className="text-gray-500">まだ記事が投稿されていません。</p>
			</div>
		);
	}

	// 絵文字かどうかを判定
	const isEmoji = (str: string) => {
		const emojiRegex = /^[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]$/u;
		return emojiRegex.test(str);
	};

	return (
		<div className="space-y-6">
			{/* 2カラムグリッド */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				{posts.map((post: any) => (
					<Link 
						key={post.id} 
						href={`/posts/${post.slug}`}
						className="block"
					>
						<article className="bg-white rounded-lg shadow hover:shadow-lg transition-all duration-200 hover:-translate-y-1 h-full">
							<div className="p-6 h-full flex flex-col">
								{post.featuredImage && (
									<div className="mb-4 flex-shrink-0">
										{isEmoji(post.featuredImage) ? (
											// 絵文字の場合
											<div className="w-full h-32 flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg">
												<span className="text-5xl">{post.featuredImage}</span>
											</div>
										) : (
											// 通常の画像URLの場合
											<img 
												src={post.featuredImage} 
												alt={post.title}
												className="w-full h-32 object-cover rounded-lg"
											/>
										)}
									</div>
								)}
								
								<div className="flex items-center text-sm text-gray-500 mb-2 flex-shrink-0">
									{post.categories && post.categories.length > 0 && (
										<>
											<div className="flex flex-wrap gap-1 mr-2">
												{post.categories.map((postCategory: any, index: number) => (
													<span 
														key={postCategory.category.id}
														className="text-blue-600 font-medium text-xs bg-blue-50 px-2 py-1 rounded-full"
													>
														{postCategory.category.name}
													</span>
												))}
											</div>
											<span className="mx-2">•</span>
										</>
									)}
									<time dateTime={post.publishedAt?.toISOString()}>
										{post.publishedAt?.toLocaleDateString('ja-JP')}
									</time>
								</div>
								
								<h2 className="text-lg font-bold text-gray-900 mb-3 flex-shrink-0 line-clamp-2">
									{post.title}
								</h2>
								
								{post.excerpt && (
									<p className="text-gray-600 mb-4 line-clamp-3 flex-grow">
										{post.excerpt}
									</p>
								)}
								
								<div className="flex items-center text-sm text-gray-500 mt-auto pt-2 flex-shrink-0">
									<span>
										by{" "}
										{post.createdBy?.id ? (
											<button
												onClick={(e) => {
													e.preventDefault();
													e.stopPropagation();
													router.push(`/users/${post.createdBy.id}`);
												}}
												className="text-blue-600 hover:text-blue-800 hover:underline font-medium transition-colors bg-transparent border-none p-0 cursor-pointer"
											>
												{post.createdBy.name}
											</button>
										) : (
											<span className="font-medium">{post.createdBy?.name || "匿名"}</span>
										)}
									</span>
									<svg className="ml-auto w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
									</svg>
								</div>
							</div>
						</article>
					</Link>
				))}
			</div>
			
			{hasNextPage && (
				<div className="text-center py-4">
					<button
						onClick={() => fetchNextPage()}
						disabled={isFetchingNextPage}
						className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
					>
						{isFetchingNextPage ? "読み込み中..." : "もっと見る"}
					</button>
				</div>
			)}
		</div>
	);
}

function BlogPostListSkeleton() {
	return (
		<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
			{[...Array(6)].map((_, i) => (
				<div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
					<div className="h-32 bg-gray-200 rounded mb-4" />
					<div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
					<div className="h-3 bg-gray-200 rounded w-1/2 mb-4" />
					<div className="h-3 bg-gray-200 rounded w-full mb-2" />
					<div className="h-3 bg-gray-200 rounded w-2/3" />
				</div>
			))}
		</div>
	);
}

export function BlogPostList() {
	return (
		<Suspense fallback={<BlogPostListSkeleton />}>
			<BlogPostListContent />
		</Suspense>
	);
} 