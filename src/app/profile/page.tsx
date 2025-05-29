"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { ProfileForm } from "~/app/_components/profile/profile-form";
import { NotificationProvider } from "~/app/_components/admin/notification-context";
import { NotificationContainer } from "~/app/_components/admin/notification-container";
import { Footer } from "~/app/_components/footer";

export default function ProfilePage() {
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
				<main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
					{/* ページヘッダー */}
					<div className="mb-8">
						<div className="flex items-center justify-between">
							<div>
								<h1 className="text-2xl font-bold text-gray-900">プロフィール設定</h1>
								<p className="text-gray-600 mt-1">あなたのプロフィール情報を管理します</p>
							</div>
							<Link
								href="/"
								className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
							>
								ホームに戻る
							</Link>
						</div>
					</div>

					{/* プロフィールフォーム */}
					<ProfileForm />
				</main>

				{/* フッター */}
				<Footer />

				<NotificationContainer />
			</div>
		</NotificationProvider>
	);
} 