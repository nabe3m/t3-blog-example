import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "~/server/auth";

export default async function AdminPage() {
	const session = await auth();

	if (!session) {
		redirect("/");
	}

	return (
		<div className="min-h-screen bg-gray-50">
			{/* ヘッダー */}
			<header className="bg-white shadow-sm">
				<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
					<div className="flex h-16 items-center justify-between">
						<h1 className="text-xl font-bold text-gray-900">管理画面</h1>
						<div className="flex items-center space-x-4">
							<span className="text-gray-700">
								{session.user.name || session.user.email}
							</span>
							<Link href="/" className="text-gray-700 hover:text-gray-900">
								サイトを見る
							</Link>
						</div>
					</div>
				</div>
			</header>

			{/* メインコンテンツ */}
			<main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
				<div className="mb-8">
					<h2 className="text-2xl font-bold text-gray-900">ダッシュボード</h2>
					<p className="mt-2 text-gray-600">
						ブログ記事とカテゴリの管理ができます
					</p>
				</div>

				{/* 管理メニュー */}
				<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
					{/* 記事管理 */}
					<Link href="/admin/posts" className="group">
						<div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow cursor-pointer group-hover:ring-2 group-hover:ring-blue-500 group-hover:ring-opacity-50">
							<div className="p-5">
								<div className="flex items-center">
									<div className="flex-shrink-0">
										<div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center group-hover:bg-blue-700 transition-colors">
											<svg
												className="w-5 h-5 text-white"
												fill="none"
												stroke="currentColor"
												viewBox="0 0 24 24"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth={2}
													d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
												/>
											</svg>
										</div>
									</div>
									<div className="ml-5 w-0 flex-1">
										<dl>
											<dt className="text-sm font-medium text-gray-500 truncate">
												記事管理
											</dt>
											<dd>
												<div className="text-lg font-medium text-gray-900 group-hover:text-blue-700 transition-colors">
													記事の作成・編集・削除
												</div>
											</dd>
										</dl>
									</div>
								</div>
							</div>
							<div className="bg-gray-50 px-5 py-3 group-hover:bg-blue-50 transition-colors">
								<div className="text-sm">
									<span className="font-medium text-blue-700 group-hover:text-blue-900">
										記事一覧を見る →
									</span>
								</div>
							</div>
						</div>
					</Link>

					{/* カテゴリ管理 */}
					<Link href="/admin/categories" className="group">
						<div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow cursor-pointer group-hover:ring-2 group-hover:ring-green-500 group-hover:ring-opacity-50">
							<div className="p-5">
								<div className="flex items-center">
									<div className="flex-shrink-0">
										<div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center group-hover:bg-green-700 transition-colors">
											<svg
												className="w-5 h-5 text-white"
												fill="none"
												stroke="currentColor"
												viewBox="0 0 24 24"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth={2}
													d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
												/>
											</svg>
										</div>
									</div>
									<div className="ml-5 w-0 flex-1">
										<dl>
											<dt className="text-sm font-medium text-gray-500 truncate">
												カテゴリ管理
											</dt>
											<dd>
												<div className="text-lg font-medium text-gray-900 group-hover:text-green-700 transition-colors">
													カテゴリの作成・編集・削除
												</div>
											</dd>
										</dl>
									</div>
								</div>
							</div>
							<div className="bg-gray-50 px-5 py-3 group-hover:bg-green-50 transition-colors">
								<div className="text-sm">
									<span className="font-medium text-green-700 group-hover:text-green-900">
										カテゴリ一覧を見る →
									</span>
								</div>
							</div>
						</div>
					</Link>

					{/* いいね管理 */}
					<Link href="/admin/likes" className="group">
						<div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow cursor-pointer group-hover:ring-2 group-hover:ring-red-500 group-hover:ring-opacity-50">
							<div className="p-5">
								<div className="flex items-center">
									<div className="flex-shrink-0">
										<div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center group-hover:bg-red-700 transition-colors">
											<svg
												className="w-5 h-5 text-white"
												fill="currentColor"
												viewBox="0 0 24 24"
											>
												<path d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"/>
											</svg>
										</div>
									</div>
									<div className="ml-5 w-0 flex-1">
										<dl>
											<dt className="text-sm font-medium text-gray-500 truncate">
												いいね管理
											</dt>
											<dd>
												<div className="text-lg font-medium text-gray-900 group-hover:text-red-700 transition-colors">
													いいねした記事の一覧
												</div>
											</dd>
										</dl>
									</div>
								</div>
							</div>
							<div className="bg-gray-50 px-5 py-3 group-hover:bg-red-50 transition-colors">
								<div className="text-sm">
									<span className="font-medium text-red-700 group-hover:text-red-900">
										いいね一覧を見る →
									</span>
								</div>
							</div>
						</div>
					</Link>

					{/* ブックマーク管理 */}
					<Link href="/admin/bookmarks" className="group">
						<div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow cursor-pointer group-hover:ring-2 group-hover:ring-purple-500 group-hover:ring-opacity-50">
							<div className="p-5">
								<div className="flex items-center">
									<div className="flex-shrink-0">
										<div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center group-hover:bg-purple-700 transition-colors">
											<svg
												className="w-5 h-5 text-white"
												fill="currentColor"
												viewBox="0 0 24 24"
											>
												<path d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z"/>
											</svg>
										</div>
									</div>
									<div className="ml-5 w-0 flex-1">
										<dl>
											<dt className="text-sm font-medium text-gray-500 truncate">
												ブックマーク管理
											</dt>
											<dd>
												<div className="text-lg font-medium text-gray-900 group-hover:text-purple-700 transition-colors">
													ブックマークした記事の一覧
												</div>
											</dd>
										</dl>
									</div>
								</div>
							</div>
							<div className="bg-gray-50 px-5 py-3 group-hover:bg-purple-50 transition-colors">
								<div className="text-sm">
									<span className="font-medium text-purple-700 group-hover:text-purple-900">
										ブックマーク一覧を見る →
									</span>
								</div>
							</div>
						</div>
					</Link>

					{/* プロフィール設定 */}
					<Link href="/profile" className="group">
						<div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow cursor-pointer group-hover:ring-2 group-hover:ring-green-500 group-hover:ring-opacity-50">
							<div className="p-5">
								<div className="flex items-center">
									<div className="flex-shrink-0">
										<div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center group-hover:bg-green-700 transition-colors">
											<svg
												className="w-5 h-5 text-white"
												fill="none"
												stroke="currentColor"
												viewBox="0 0 24 24"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth={2}
													d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
												/>
											</svg>
										</div>
									</div>
									<div className="ml-5 w-0 flex-1">
										<dl>
											<dt className="text-sm font-medium text-gray-500 truncate">
												プロフィール設定
											</dt>
											<dd>
												<div className="text-lg font-medium text-gray-900 group-hover:text-green-700 transition-colors">
													アカウント情報の管理
												</div>
											</dd>
										</dl>
									</div>
								</div>
							</div>
							<div className="bg-gray-50 px-5 py-3 group-hover:bg-green-50 transition-colors">
								<div className="text-sm">
									<span className="font-medium text-green-700 group-hover:text-green-900">
										プロフィールを編集 →
									</span>
								</div>
							</div>
						</div>
					</Link>

					{/* 統計情報 */}
					<div className="bg-white overflow-hidden shadow rounded-lg opacity-60 cursor-not-allowed">
						<div className="p-5">
							<div className="flex items-center">
								<div className="flex-shrink-0">
									<div className="w-8 h-8 bg-gray-600 rounded-lg flex items-center justify-center">
										<svg
											className="w-5 h-5 text-white"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
											/>
										</svg>
									</div>
								</div>
								<div className="ml-5 w-0 flex-1">
									<dl>
										<dt className="text-sm font-medium text-gray-500 truncate">
											サイト統計
										</dt>
										<dd>
											<div className="text-lg font-medium text-gray-900">
												アクセス統計・分析
											</div>
										</dd>
									</dl>
								</div>
							</div>
						</div>
						<div className="bg-gray-50 px-5 py-3">
							<div className="text-sm">
								<span className="font-medium text-gray-500">
									近日実装予定
								</span>
							</div>
						</div>
					</div>
				</div>

				{/* クイックアクション */}
				<div className="mt-8">
					<h3 className="text-lg font-medium text-gray-900 mb-4">クイックアクション</h3>
					<div className="flex flex-wrap gap-4">
						<Link
							href="/admin/posts/new"
							className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
						>
							新規記事作成
						</Link>
						<Link
							href="/admin/categories/new"
							className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
						>
							新規カテゴリ作成
						</Link>
						<Link
							href="/admin/likes"
							className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
						>
							いいね一覧
						</Link>
						<Link
							href="/admin/bookmarks"
							className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors"
						>
							ブックマーク一覧
						</Link>
						<Link
							href="/profile"
							className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
						>
							プロフィール設定
						</Link>
					</div>
				</div>
			</main>
		</div>
	);
} 