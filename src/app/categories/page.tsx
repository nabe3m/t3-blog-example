"use client";

import Link from "next/link";
import { api } from "~/trpc/react";
import { useSession } from "next-auth/react";
import { Footer } from "~/app/_components/footer";

export default function CategoriesPage() {
	const { data: session } = useSession();
	const { data: categories, isLoading, error } = api.category.getAll.useQuery();

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
							<Link href="/categories" className="text-blue-600 font-medium">
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
				<div className="mb-8">
					<h1 className="text-3xl font-bold text-gray-900 mb-2">
						カテゴリ一覧
					</h1>
					<p className="text-gray-600">
						記事のカテゴリ一覧です
					</p>
				</div>

				{isLoading && (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{[...Array(6)].map((_, i) => (
							<div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
								<div className="h-6 bg-gray-200 rounded w-3/4 mb-3" />
								<div className="h-4 bg-gray-200 rounded w-full mb-2" />
								<div className="h-4 bg-gray-200 rounded w-2/3" />
							</div>
						))}
					</div>
				)}

				{error && (
					<div className="bg-red-50 border border-red-200 rounded-lg p-4">
						<p className="text-red-600">カテゴリの読み込み中にエラーが発生しました。</p>
					</div>
				)}

				{categories && categories.length === 0 && (
					<div className="bg-white rounded-lg shadow p-8 text-center">
						<p className="text-gray-500">まだカテゴリが作成されていません。</p>
					</div>
				)}

				{categories && categories.length > 0 && (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{categories.map((category: any) => (
							<div key={category.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
								<div className="p-6">
									<h3 className="text-lg font-semibold text-gray-900 mb-2">
										<Link 
											href={`/categories/${category.slug}`}
											className="hover:text-blue-600 transition-colors"
										>
											{category.name}
										</Link>
									</h3>
									{category.description && (
										<p className="text-gray-600 mb-4">
											{category.description}
										</p>
									)}
									<div className="flex items-center justify-between">
										<span className="text-sm text-gray-500">
											{category._count?.posts || 0} 件の記事
										</span>
										<Link 
											href={`/categories/${category.slug}`}
											className="text-blue-600 hover:text-blue-700 text-sm font-medium"
										>
											記事を見る →
										</Link>
									</div>
								</div>
							</div>
						))}
					</div>
				)}
			</main>

			{/* フッター */}
			<Footer />
		</div>
	);
} 