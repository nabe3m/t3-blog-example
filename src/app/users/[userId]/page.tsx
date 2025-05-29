"use client";

import { notFound, useParams } from "next/navigation";
import Link from "next/link";
import { api } from "~/trpc/react";
import { useSession } from "next-auth/react";
import { UserPostsList } from "~/app/_components/user/user-posts-list";
import { Footer } from "~/app/_components/footer";

export default function UserArchivePage() {
	const params = useParams();
	const userId = params.userId as string;
	const { data: session } = useSession();
	
	const { data: user, isLoading: userLoading, error } = api.user.getById.useQuery(
		{ userId },
		{ enabled: !!userId && userId.length > 0 }
	);

	const { data: stats, isLoading: statsLoading } = api.user.getStats.useQuery(
		{ userId },
		{ enabled: !!userId && userId.length > 0 }
	);

	if (!userId || userId.length === 0) {
		notFound();
	}

	if (userLoading) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				<div className="text-center">
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
					<p className="mt-4 text-gray-600 text-sm">ユーザー情報を読み込み中...</p>
				</div>
			</div>
		);
	}

	if (error || !user) {
		notFound();
	}

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
						<li className="text-gray-400">/</li>
						<li>
							<span className="text-gray-900">ユーザー</span>
						</li>
						<li className="text-gray-400">/</li>
						<li className="text-gray-900">{user.name}</li>
					</ol>
				</nav>

				<div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
					{/* メインエリア */}
					<div className="lg:col-span-3">
						<div className="mb-8">
							<h1 className="text-3xl font-bold text-gray-900 mb-2">
								{user.name}の記事
							</h1>
							{user.bio && (
								<p className="text-gray-600 leading-relaxed">
									{user.bio}
								</p>
							)}
						</div>
						
						{/* 記事一覧 */}
						<UserPostsList userId={userId} />
					</div>

					{/* サイドバー */}
					<div className="lg:col-span-1">
						{/* ユーザープロフィール */}
						<div className="bg-white rounded-lg shadow p-6 sticky top-4">
							<div className="text-center">
								{/* アバター */}
								<div className="mb-4">
									{user.image ? (
										<img 
											src={user.image} 
											alt={user.name || "ユーザー"} 
											className="w-20 h-20 rounded-full mx-auto"
										/>
									) : (
										<div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center mx-auto">
											<svg className="w-10 h-10 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
												<path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
											</svg>
										</div>
									)}
								</div>

								{/* ユーザー名 */}
								<h2 className="text-lg font-semibold text-gray-900 mb-2">
									{user.name}
								</h2>

								{/* プロフィール文 */}
								{user.bio && (
									<p className="text-sm text-gray-600 mb-4 leading-relaxed">
										{user.bio}
									</p>
								)}

								{/* 統計情報 */}
								{!statsLoading && stats && (
									<div className="grid grid-cols-3 gap-4 mb-4">
										<div className="text-center">
											<div className="text-xl font-bold text-gray-900">{stats.totalPosts}</div>
											<div className="text-xs text-gray-500">記事</div>
										</div>
										<div className="text-center">
											<div className="text-xl font-bold text-gray-900">{stats.totalLikes}</div>
											<div className="text-xs text-gray-500">いいね</div>
										</div>
										<div className="text-center">
											<div className="text-xl font-bold text-gray-900">{stats.totalBookmarks}</div>
											<div className="text-xs text-gray-500">ブックマーク</div>
										</div>
									</div>
								)}

								{/* ソーシャルリンク */}
								{(user.website || user.twitter || user.github) && (
									<div className="flex justify-center space-x-4">
										{user.website && (
											<a
												href={user.website}
												target="_blank"
												rel="noopener noreferrer"
												className="text-blue-600 hover:text-blue-800 transition-colors"
												title="ウェブサイト"
											>
												<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
													<path d="M21.721 12.752a9.711 9.711 0 00-.945-5.003 12.754 12.754 0 01-4.339 2.708 18.991 18.991 0 01-.214 4.772 17.165 17.165 0 005.498-2.477zM14.634 15.55a17.324 17.324 0 00.332-4.647c-.952.227-1.945.347-2.966.347-1.021 0-2.014-.12-2.966-.347a17.515 17.515 0 00.332 4.647 17.385 17.385 0 005.268 0zM9.772 17.119a18.963 18.963 0 004.456 0A17.182 17.182 0 0112 21.724a17.18 17.18 0 01-2.228-4.605zM7.777 15.23a18.87 18.87 0 01-.214-4.774 12.753 12.753 0 01-4.34-2.708 9.711 9.711 0 00-.944 5.004 17.165 17.165 0 005.498 2.477zM21.356 14.752a9.765 9.765 0 01-7.478 6.817 18.64 18.64 0 001.988-4.718 18.627 18.627 0 005.49-2.098zM2.644 14.752c1.682.971 3.53 1.688 5.49 2.099a18.64 18.64 0 001.988 4.718 9.765 9.765 0 01-7.478-6.817zM13.878 2.43a9.755 9.755 0 016.116 3.986 11.267 11.267 0 01-3.746 2.504 18.63 18.63 0 00-2.37-6.49zM12 2.276a17.152 17.152 0 012.805 7.121c-.897.23-1.842.353-2.805.353-.963 0-1.908-.122-2.805-.353A17.151 17.151 0 0112 2.276zM10.122 2.43a18.629 18.629 0 00-2.37 6.49 11.266 11.266 0 01-3.746-2.504 9.754 9.754 0 016.116-3.986z"/>
												</svg>
											</a>
										)}
										{user.twitter && (
											<a
												href={`https://x.com/${user.twitter}`}
												target="_blank"
												rel="noopener noreferrer"
												className="text-black-400 hover:text-blue-600 transition-colors"
												title={`@${user.twitter}`}
											>
												<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
													<path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
												</svg>
											</a>
										)}
										{user.github && (
											<a
												href={`https://github.com/${user.github}`}
												target="_blank"
												rel="noopener noreferrer"
												className="text-gray-700 hover:text-gray-900 transition-colors"
												title={user.github}
											>
												<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
													<path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
												</svg>
											</a>
										)}
									</div>
								)}
							</div>
						</div>
					</div>
				</div>
			</main>

			{/* フッター */}
			<Footer />
		</div>
	);
} 