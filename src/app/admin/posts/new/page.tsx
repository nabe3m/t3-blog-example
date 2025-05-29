import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "~/server/auth";
import { PostForm } from "~/app/_components/admin/post-form";

export default async function NewPostPage() {
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
							<Link href="/admin/posts" className="text-lg font-medium text-gray-700 hover:text-gray-900">
								← 記事一覧
							</Link>
							<h1 className="text-xl font-bold text-gray-900">新規記事作成</h1>
						</div>
						<Link href="/" className="text-gray-700 hover:text-gray-900">
							サイトを見る
						</Link>
					</div>
				</div>
			</header>

			{/* メインコンテンツ */}
			<main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
				<div className="bg-white rounded-lg shadow p-6">
					<PostForm />
				</div>
			</main>
		</div>
	);
} 