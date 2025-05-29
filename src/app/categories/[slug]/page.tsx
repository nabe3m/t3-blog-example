"use client";

import Link from "next/link";
import { useParams, notFound } from "next/navigation";
import { api } from "~/trpc/react";
import { useSession } from "next-auth/react";
import type { Category, Post } from "~/types";
import { Footer } from "~/app/_components/footer";

export default function CategoryPage() {
	const params = useParams();
	const slug = params.slug as string;
	const { data: session } = useSession();
	
	// カテゴリ情報取得（将来的にgetBySlugを追加）
	const { data: categories } = api.category.getAll.useQuery();
	const category = categories?.find((cat: Category) => cat.slug === slug);
	
	// カテゴリ別記事取得
	const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, error } = 
		api.post.getPublished.useInfiniteQuery(
			{ 
				limit: 10,
				categoryId: category?.id 
			},
			{
				getNextPageParam: (lastPage) => lastPage.nextCursor,
				enabled: !!category?.id,
			}
		);

	if (!category && categories) {
		notFound();
	}

	const posts = data?.pages.flatMap((page) => page.posts) ?? [];

	// 絵文字かどうかを判定
	const isEmoji = (str: string) => {
		const emojiRegex = /^[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]$/u;
		return emojiRegex.test(str);
	};

	return (
		<div className="min-h-screen bg-gray-50">
			{/* ヘッダー */}
			<header className="bg-white shadow-sm">
				<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
					<div className="flex h-16 items-center justify-between">
						<div className="flex items-center">
							<Link href="/" className="text-xl font-bold text-gray-900">
								T3 Blog App
							</Link>
						</div>
						<nav className="flex items-center space-x-8">
							<Link href="/" className="text-gray-700 hover:text-gray-900">
								ホーム
							</Link>
							<Link href="/categories" className="text-gray-700 hover:text-gray-900">
								カテゴリ
							</Link>
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
						</nav>
					</div>
				</div>
			</header>

			{/* メインコンテンツ */}
			<main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
				{/* パンくずナビ */}
				<nav className="mb-6">
					<ol className="flex items-center space-x-2 text-sm text-gray-500">
						<li>
							<Link href="/" className="hover:text-gray-700">
								ホーム
							</Link>
						</li>
						<li>/</li>
						<li>
							<Link href="/categories" className="hover:text-gray-700">
								カテゴリ
							</Link>
						</li>
						<li>/</li>
						<li className="text-gray-900 font-medium">
							{category?.name}
						</li>
					</ol>
				</nav>

				{/* カテゴリヘッダー */}
				<div className="mb-8">
					<h1 className="text-3xl font-bold text-gray-900 mb-2">
						{category?.name}
					</h1>
					{category?.description && (
						<p className="text-gray-600">
							{category.description}
						</p>
					)}
				</div>

				{/* 記事一覧 */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					{isLoading && (
						<>
							{[...Array(6)].map((_, i) => (
								<div key={i} className="bg-white rounded-lg shadow p-4 animate-pulse">
									<div className="h-32 bg-gray-200 rounded w-full mb-3" />
									<div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
									<div className="h-3 bg-gray-200 rounded w-1/2 mb-2" />
									<div className="h-3 bg-gray-200 rounded w-full mb-1" />
									<div className="h-3 bg-gray-200 rounded w-2/3" />
								</div>
							))}
						</>
					)}

					{error && (
						<div className="col-span-1 md:col-span-2 bg-red-50 border border-red-200 rounded-lg p-4">
							<p className="text-red-600">記事の読み込み中にエラーが発生しました。</p>
						</div>
					)}

					{posts.length === 0 && !isLoading && (
						<div className="col-span-1 md:col-span-2 bg-white rounded-lg shadow p-8 text-center">
							<p className="text-gray-500">このカテゴリにはまだ記事がありません。</p>
						</div>
					)}

					{posts.map((post: Post) => (
						<article key={post.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
							<Link href={`/posts/${post.slug}`} className="block">
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
									<div className="flex items-center text-xs text-gray-500 mb-2">
										<time dateTime={post.publishedAt?.toISOString()}>
											{post.publishedAt?.toLocaleDateString('ja-JP')}
										</time>
										<span className="mx-1">•</span>
										<span>{post.createdBy.name}</span>
									</div>
									
									<h2 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 hover:text-blue-600 transition-colors">
										{post.title}
									</h2>
									
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
				
				{hasNextPage && (
					<div className="text-center py-6">
						<button
							onClick={() => fetchNextPage()}
							disabled={isFetchingNextPage}
							className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
						>
							{isFetchingNextPage ? "読み込み中..." : "もっと見る"}
						</button>
					</div>
				)}
			</main>

			{/* フッター */}
			<Footer />
		</div>
	);
} 