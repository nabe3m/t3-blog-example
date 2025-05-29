import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { auth } from "~/server/auth";
import { EditPostForm } from "~/app/_components/admin/edit-post-form";

interface EditPostPageProps {
	params: Promise<{ id: string }>;
}

export default async function EditPostPage({ params }: EditPostPageProps) {
	const session = await auth();

	if (!session) {
		redirect("/");
	}

	const { id } = await params;
	const postId = Number(id);

	if (isNaN(postId)) {
		notFound();
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
							<h1 className="text-xl font-bold text-gray-900">記事編集</h1>
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
					<EditPostForm postId={postId} />
				</div>
			</main>
		</div>
	);
} 