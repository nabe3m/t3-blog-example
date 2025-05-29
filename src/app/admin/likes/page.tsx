"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { LikesList } from "~/app/_components/admin/likes-list";
import { NotificationProvider } from "~/app/_components/admin/notification-context";

export default function AdminLikesPage() {
	const { data: session, status } = useSession();

	if (status === "loading") {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
			</div>
		);
	}

	if (!session?.user) {
		redirect("/api/auth/signin");
	}

	return (
		<NotificationProvider>
			<div className="min-h-screen bg-gray-50">
				{/* ヘッダー */}
				<header className="bg-white shadow-sm border-b">
					<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
						<div className="flex h-16 items-center justify-between">
							<div className="flex items-center">
								<Link href="/" className="text-xl font-bold text-gray-900">
									Blog System
								</Link>
							</div>
							<nav className="flex items-center space-x-8">
								<Link href="/" className="text-gray-700 hover:text-gray-900">
									ホーム
								</Link>
								<Link href="/categories" className="text-gray-700 hover:text-gray-900">
									カテゴリ
								</Link>
								<Link 
									href="/admin" 
									className="rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
								>
									管理画面
								</Link>
								<Link
									href="/api/auth/signout"
									className="rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
								>
									ログアウト
								</Link>
							</nav>
						</div>
					</div>
				</header>

				{/* メインコンテンツ */}
				<main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
					{/* ページヘッダー */}
					<div className="mb-8">
						<div className="flex items-center justify-between">
							<div>
								<h1 className="text-2xl font-bold text-gray-900">いいね一覧</h1>
								<p className="text-gray-600 mt-1">あなたがいいねした記事の一覧です</p>
							</div>
							<div className="flex space-x-4">
								<Link
									href="/admin"
									className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
								>
									管理画面トップ
								</Link>
								<Link
									href="/admin/bookmarks"
									className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
								>
									ブックマーク一覧
								</Link>
							</div>
						</div>
					</div>

					{/* いいね一覧 */}
					<div className="bg-white rounded-lg border border-gray-200 p-6">
						<LikesList />
					</div>
				</main>
			</div>
		</NotificationProvider>
	);
} 