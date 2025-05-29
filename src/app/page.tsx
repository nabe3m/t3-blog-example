"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { BlogPostList } from "~/app/_components/blog-post-list";
import { CategoryList } from "~/app/_components/category-list";
import { ProfileSidebar } from "~/app/_components/sidebar/profile-sidebar";
import { Footer } from "~/app/_components/footer";

export default function Home() {
	const { data: session } = useSession();

	// ハイドレーション問題を避けるため、プリフェッチを一時的に無効化
	// void api.post.getPublished.prefetch({ limit: 10 });
	// void api.category.getAll.prefetch();

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
				<div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
					{/* メインエリア */}
					<div className="lg:col-span-3">
						<div className="mb-8">
							<h1 className="text-3xl font-bold text-gray-900 mb-2">
								最新の記事
							</h1>
							<p className="text-gray-600">
								ブログシステムの最新記事をご覧ください
							</p>
						</div>
						<BlogPostList />
					</div>

					{/* サイドバー */}
					<div className="lg:col-span-1">
						<div className="bg-white rounded-lg shadow p-6">
							<h2 className="text-lg font-semibold text-gray-900 mb-4">
								カテゴリ
							</h2>
							<CategoryList />
						</div>
						
						{/* プロフィールサイドバー */}
						<ProfileSidebar />
					</div>
				</div>
			</main>

			{/* フッター */}
			<Footer />
		</div>
	);
}
