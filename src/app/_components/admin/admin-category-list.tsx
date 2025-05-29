"use client";

import Link from "next/link";
import { api } from "~/trpc/react";

export function AdminCategoryList() {
	const { data: categories, isLoading, error, refetch } = api.category.getAllAdmin.useQuery();

	const deleteCategory = api.category.delete.useMutation({
		onSuccess: () => {
			refetch();
		},
	});

	const handleDelete = (id: number, name: string) => {
		if (confirm(`「${name}」を削除しますか？このカテゴリに属する記事のカテゴリは未設定になります。`)) {
			deleteCategory.mutate({ id });
		}
	};

	if (isLoading) {
		return (
			<div className="space-y-4">
				{[...Array(3)].map((_, i) => (
					<div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
						<div className="flex justify-between items-start">
							<div className="flex-1">
								<div className="h-5 bg-gray-200 rounded w-1/4 mb-2" />
								<div className="h-4 bg-gray-200 rounded w-3/4 mb-4" />
								<div className="h-3 bg-gray-200 rounded w-1/6" />
							</div>
							<div className="flex space-x-2">
								<div className="h-8 bg-gray-200 rounded w-16" />
								<div className="h-8 bg-gray-200 rounded w-16" />
							</div>
						</div>
					</div>
				))}
			</div>
		);
	}

	if (error) {
		return (
			<div className="bg-red-50 border border-red-200 rounded-lg p-4">
				<p className="text-red-600">カテゴリの読み込み中にエラーが発生しました。</p>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* カテゴリ一覧 */}
			{categories?.length === 0 ? (
				<div className="bg-white rounded-lg shadow p-8 text-center">
					<p className="text-gray-500">カテゴリがありません。</p>
					<Link
						href="/admin/categories/new"
						className="mt-4 inline-block rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
					>
						最初のカテゴリを作成
					</Link>
				</div>
			) : (
				<div className="space-y-4">
					{categories?.map((category: any) => (
						<div key={category.id} className="bg-white rounded-lg shadow p-6">
							<div className="flex justify-between items-start">
								<div className="flex-1">
									<div className="flex items-center space-x-2 mb-2">
										<h3 className="text-lg font-semibold text-gray-900">
											{category.name}
										</h3>
									</div>
									<p className="text-gray-600 text-sm mb-2">
										スラッグ: {category.slug}
									</p>
									{category.description && (
										<p className="text-gray-600 text-sm mb-2">
											説明: {category.description}
										</p>
									)}
									<p className="text-gray-500 text-sm">
										記事数: {category._count?.posts || 0} | 
										作成日: {new Date(category.createdAt).toLocaleDateString('ja-JP')}
									</p>
								</div>
								<div className="flex space-x-2">
									<Link
										href={`/admin/categories/${category.id}/edit`}
										className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
									>
										編集
									</Link>
									<button
										onClick={() => handleDelete(category.id, category.name)}
										disabled={deleteCategory.isPending}
										className="px-3 py-1 text-sm bg-red-100 text-red-800 rounded-md hover:bg-red-200 disabled:opacity-50"
									>
										削除
									</button>
								</div>
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	);
} 