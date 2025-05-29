import { notFound } from "next/navigation";
import Link from "next/link";
import { api } from "~/trpc/server";
import type { Metadata } from "next";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { PostPageClient, HeaderNavigation, PostActions } from "./post-page-client";
import { Footer } from "~/app/_components/footer";

interface PostPageProps {
	params: Promise<{ slug: string }>;
}

// メタデータ生成
export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
	try {
		const { slug } = await params;
		const post = await api.post.getBySlug({ slug });
		
		if (!post) {
			return {
				title: "記事が見つかりません | T3 Blog App",
				description: "指定された記事が見つかりませんでした。",
			};
		}

		const article = post as any;
		
		return {
			title: `${article.title} | T3 Blog App`,
			description: article.excerpt || `${article.title}の記事をお読みください。`,
			openGraph: {
				title: article.title,
				description: article.excerpt || `${article.title}の記事をお読みください。`,
				type: "article",
				publishedTime: article.publishedAt?.toISOString(),
				authors: [article.createdBy?.name || "匿名"],
				images: article.featuredImage && !isEmoji(article.featuredImage) 
					? [{ url: article.featuredImage, alt: article.title }] 
					: undefined,
			},
			twitter: {
				card: "summary_large_image",
				title: article.title,
				description: article.excerpt || `${article.title}の記事をお読みください。`,
				images: article.featuredImage && !isEmoji(article.featuredImage) 
					? [article.featuredImage] 
					: undefined,
			},
		};
	} catch (error) {
		return {
			title: "記事が見つかりません | T3 Blog App",
			description: "指定された記事が見つかりませんでした。",
		};
	}
}

// 絵文字かどうかを判定
function isEmoji(str: string) {
	const emojiRegex = /^[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]$/u;
	return emojiRegex.test(str);
}

export default async function PostPage({ params }: PostPageProps) {
	let post;
	
	try {
		const { slug } = await params;
		post = await api.post.getBySlug({ slug });
	} catch (error) {
		notFound();
	}

	if (!post) {
		notFound();
	}

	// 型安全性のための型アサーション
	const article = post as any;

	return (
		<PostPageClient>
			<div className="min-h-screen bg-white">
				{/* ヘッダー */}
				<header className="bg-white shadow-sm border-b">
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
								<HeaderNavigation />
							</nav>
						</div>
					</div>
				</header>

				{/* メインコンテンツ */}
				<main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
					{/* パンくずナビ */}
					<nav className="mb-6">
						<ol className="flex items-center space-x-2 text-sm text-gray-500">
							<li>
								<Link href="/" className="hover:text-gray-700">
									ホーム
								</Link>
							</li>
							<li className="text-gray-400">/</li>
							<li className="text-gray-900">記事</li>
						</ol>
					</nav>

					<article className="bg-white">
						{/* アイキャッチ画像 */}
						{article.featuredImage && (
							<div className="mb-8">
								{isEmoji(article.featuredImage) ? (
									// 絵文字の場合
									<div className="w-full h-32 flex items-center justify-center bg-gray-50 rounded-lg">
										<span className="text-6xl">{article.featuredImage}</span>
									</div>
								) : (
									// 通常の画像URLの場合
									<img
										src={article.featuredImage}
										alt={article.title}
										className="w-full h-64 object-cover rounded-lg"
									/>
								)}
							</div>
						)}

						{/* 記事ヘッダー */}
						<header className="mb-8">
							{/* カテゴリタグ */}
							{article.categories && article.categories.length > 0 && (
								<div className="flex flex-wrap gap-2 mb-4">
									{article.categories.map((postCategory: any) => (
										<Link
											key={postCategory.category.id}
											href={`/categories/${postCategory.category.slug}`}
											className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors"
										>
											{postCategory.category.name}
										</Link>
									))}
								</div>
							)}

							{/* タイトル */}
							<h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight mb-4">
								{article.title}
							</h1>

							{/* 抜粋 */}
							{article.excerpt && (
								<p className="text-lg text-gray-600 mb-6 leading-relaxed">
									{article.excerpt}
								</p>
							)}

							{/* メタ情報 */}
							<div className="flex items-center text-sm text-gray-500 mb-6">
								<div className="flex items-center">
									{article.createdBy?.image && (
										<img
											src={article.createdBy.image}
											alt={article.createdBy.name || ""}
											className="w-6 h-6 rounded-full mr-2"
										/>
									)}
									<span className="font-medium text-gray-700 mr-3">
										{article.createdBy?.name || "匿名"}
									</span>
									<time className="mr-3">
										{new Date(article.publishedAt || article.createdAt).toLocaleDateString('ja-JP', {
											year: 'numeric',
											month: 'long',
											day: 'numeric',
										})}
									</time>
								</div>
							</div>

							{/* いいね・ブックマーク・シェアボタン */}
							<PostActions article={article} />
						</header>

						{/* 記事本文 */}
						<div className="prose prose-lg prose-gray max-w-none">
							<ReactMarkdown
								remarkPlugins={[remarkGfm]}
								rehypePlugins={[rehypeHighlight]}
								components={{
									h1: ({ children }) => (
										<h1 className="text-3xl font-bold text-gray-900 mt-10 mb-6 border-b border-gray-200 pb-3">
											{children}
										</h1>
									),
									h2: ({ children }) => (
										<h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
											{children}
										</h2>
									),
									h3: ({ children }) => (
										<h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">
											{children}
										</h3>
									),
									h4: ({ children }) => (
										<h4 className="text-lg font-semibold text-gray-900 mt-4 mb-2">
											{children}
										</h4>
									),
									p: ({ children }) => (
										<p className="text-gray-700 leading-relaxed mb-4">
											{children}
										</p>
									),
									blockquote: ({ children }) => (
										<blockquote className="border-l-4 border-blue-500 pl-4 py-2 bg-blue-50 text-gray-700 italic mb-4">
											{children}
										</blockquote>
									),
									code: ({ children, className }) => {
										const isInline = !className;
										if (isInline) {
											return (
												<code className="bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded text-sm font-mono">
													{children}
												</code>
											);
										}
										return (
											<code className={`${className} text-sm`}>
												{children}
											</code>
										);
									},
									pre: ({ children }) => (
										<pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto mb-4 text-sm">
											{children}
										</pre>
									),
									ul: ({ children }) => (
										<ul className="list-disc list-inside mb-4 space-y-1">
											{children}
										</ul>
									),
									ol: ({ children }) => (
										<ol className="list-decimal list-inside mb-4 space-y-1">
											{children}
										</ol>
									),
									li: ({ children }) => (
										<li className="text-gray-700">
											{children}
										</li>
									),
									a: ({ href, children }) => (
										<Link 
											href={href || '#'} 
											className="text-blue-600 hover:text-blue-800 underline"
										>
											{children}
										</Link>
									),
									table: ({ children }) => (
										<div className="overflow-x-auto mb-4">
											<table className="min-w-full border-collapse border border-gray-300">
												{children}
											</table>
										</div>
									),
									th: ({ children }) => (
										<th className="border border-gray-300 px-4 py-2 bg-gray-50 font-semibold text-left">
											{children}
										</th>
									),
									td: ({ children }) => (
										<td className="border border-gray-300 px-4 py-2">
											{children}
										</td>
									),
								}}
							>
								{article.content}
							</ReactMarkdown>
						</div>
					</article>

					{/* 著者プロフィール - サーバーサイドで表示 */}
					{article.createdBy && (
						<div className="bg-gray-50 rounded-lg p-6 mt-8 border border-gray-200">
							<h3 className="text-lg font-semibold text-gray-900 mb-4">著者について</h3>
							
							<div className="flex items-start space-x-4">
								{/* アバター */}
								<div className="flex-shrink-0">
									{article.createdBy.image ? (
										<img 
											src={article.createdBy.image} 
											alt={article.createdBy.name || "著者"} 
											className="w-16 h-16 rounded-full"
										/>
									) : (
										<div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
											<svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
												<path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
											</svg>
										</div>
									)}
								</div>

								{/* プロフィール情報 */}
								<div className="flex-1">
									<h4 className="text-lg font-medium text-gray-900 mb-2">
										{article.createdBy.name || "匿名"}
									</h4>
									
									{/* ユーザーアーカイブへのリンク */}
									{article.createdBy.id && (
										<Link 
											href={`/users/${article.createdBy.id}`}
											className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
										>
											<span>この著者の他の記事を見る</span>
											<svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
											</svg>
										</Link>
									)}
								</div>
							</div>
						</div>
					)}

					{/* ナビゲーション */}
					<div className="mt-12 pt-8 border-t border-gray-200">
						<div className="text-center">
							<Link
								href="/"
								className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
							>
								← 記事一覧に戻る
							</Link>
						</div>
					</div>
				</main>

				{/* フッター */}
				<Footer />
			</div>
		</PostPageClient>
	);
} 