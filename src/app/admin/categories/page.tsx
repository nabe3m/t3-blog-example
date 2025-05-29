import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "~/server/auth";
import { AdminCategoryList } from "~/app/_components/admin/admin-category-list";

export default async function AdminCategoriesPage() {
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
						<div className="flex items-center space-x-4">
							<Link href="/admin" className="text-lg font-medium text-gray-700 hover:text-gray-900">
								← 管理画面
							</Link>
							<h1 className="text-xl font-bold text-gray-900">カテゴリ管理</h1>
						</div>
						<div className="flex items-center space-x-4">
							<Link
								href="/admin/categories/new"
								className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
							>
								新規カテゴリ作成
							</Link>
							<Link href="/" className="text-gray-700 hover:text-gray-900">
								サイトを見る
							</Link>
						</div>
					</div>
				</div>
			</header>

			{/* メインコンテンツ */}
			<main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
				<div className="mb-6">
					<h2 className="text-2xl font-bold text-gray-900">カテゴリ一覧</h2>
					<p className="mt-2 text-gray-600">
						カテゴリの作成、編集、削除ができます
					</p>
				</div>

				<AdminCategoryList />
			</main>
		</div>
	);
} 