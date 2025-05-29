"use client";

import Link from "next/link";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { api } from "~/trpc/react";
import { useNotifications } from "./notification-context";
import type { Post } from "~/types";

export function AdminPostList() {
	const { data: session } = useSession();
	const utils = api.useUtils();
	const { addNotification } = useNotifications();
	const [filter, setFilter] = useState<"all" | "published" | "draft">("all");
	
	const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, error } = 
		api.post.getAll.useInfiniteQuery(
			{ 
				limit: 20,
				published: filter === "all" ? undefined : filter === "published",
				createdBy: session?.user?.id,
			},
			{
				getNextPageParam: (lastPage) => lastPage.nextCursor,
			}
		);

	const deletePost = api.post.delete.useMutation({
		onSuccess: async () => {
			// キャッシュを無効化
			await utils.post.invalidate();
			await utils.category.invalidate();
			
			// 成功通知を表示
			addNotification({
				type: "success",
				title: "記事を削除しました",
			});
		},
		onError: (error) => {
			addNotification({
				type: "error",
				title: "削除に失敗しました",
			});
		},
	});

	const updatePost = api.post.update.useMutation({
		onSuccess: async (_, variables) => {
			// キャッシュを無効化
			await utils.post.invalidate();
			await utils.category.invalidate();
			
			// 成功通知を表示
			addNotification({
				type: "success",
				title: variables.published ? "記事を公開しました" : "記事を非公開にしました",
			});
		},
		onError: (error) => {
			addNotification({
				type: "error",
				title: "更新に失敗しました",
			});
		},
	});

	const handleDelete = (id: number, title: string) => {
		if (confirm(`「${title}」を削除しますか？この操作は取り消せません。`)) {
			deletePost.mutate({ id });
		}
	};

	const handleTogglePublish = (id: number, currentPublished: boolean) => {
		updatePost.mutate({ 
			id, 
			published: !currentPublished 
		});
	};

	if (isLoading) {
		return (
			<div className="space-y-4">
				{[...Array(5)].map((_, i) => (
					<div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
						<div className="flex justify-between items-start">
							<div className="flex-1">
								<div className="h-5 bg-gray-200 rounded w-3/4 mb-2" />
								<div className="h-4 bg-gray-200 rounded w-1/2 mb-4" />
								<div className="h-3 bg-gray-200 rounded w-1/4" />
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
				<p className="text-red-600">記事の読み込み中にエラーが発生しました。</p>
			</div>
		);
	}

	const posts = data?.pages.flatMap((page) => page.posts) ?? [];

	return (
		<div className="space-y-6">
			{/* フィルター */}
			<div className="bg-white rounded-lg shadow p-4">
				<div className="flex space-x-4">
					<button
						onClick={() => setFilter("all")}
						className={`px-4 py-2 rounded-md text-sm font-medium ${
							filter === "all"
								? "bg-blue-600 text-white"
								: "bg-gray-100 text-gray-700 hover:bg-gray-200"
						}`}
					>
						すべて
					</button>
					<button
						onClick={() => setFilter("published")}
						className={`px-4 py-2 rounded-md text-sm font-medium ${
							filter === "published"
								? "bg-blue-600 text-white"
								: "bg-gray-100 text-gray-700 hover:bg-gray-200"
						}`}
					>
						公開中
					</button>
					<button
						onClick={() => setFilter("draft")}
						className={`px-4 py-2 rounded-md text-sm font-medium ${
							filter === "draft"
								? "bg-blue-600 text-white"
								: "bg-gray-100 text-gray-700 hover:bg-gray-200"
						}`}
					>
						下書き
					</button>
				</div>
			</div>

			{/* 記事一覧 */}
			{posts.length === 0 ? (
				<div className="bg-white rounded-lg shadow p-8 text-center">
					{filter === "draft" ? (
						<p className="text-gray-500">下書きの記事がありません。</p>
					) : filter === "published" ? (
						<p className="text-gray-500">公開中の記事がありません。</p>
					) : (
						<>
							<p className="text-gray-500">記事がありません。</p>
							<Link
								href="/admin/posts/new"
								className="mt-4 inline-block rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
							>
								最初の記事を作成
							</Link>
						</>
					)}
				</div>
			) : (
				<div className="space-y-4">
					{posts.map((post: Post) => (
						<div key={post.id} className="bg-white rounded-lg shadow p-6">
							<div className="flex justify-between items-start">
								<div className="flex-1">
									<div className="flex items-center space-x-2 mb-2">
										<h3 className="text-lg font-semibold text-gray-900">
											{post.title}
										</h3>
										<span
											className={`px-2 py-1 text-xs font-medium rounded-full ${
												post.published
													? "bg-green-100 text-green-800"
													: "bg-yellow-100 text-yellow-800"
											}`}
										>
											{post.published ? "公開中" : "下書き"}
										</span>
									</div>
									<p className="text-gray-600 text-sm mb-2">
										スラッグ: {post.slug}
									</p>
									{post.categories && post.categories.length > 0 && (
										<p className="text-gray-600 text-sm mb-2">
											カテゴリ: {post.categories.map(pc => pc.category.name).join(', ')}
										</p>
									)}
									<p className="text-gray-500 text-sm">
										作成日: {new Date(post.createdAt).toLocaleDateString('ja-JP')} | 
										更新日: {new Date(post.updatedAt).toLocaleDateString('ja-JP')}
									</p>
								</div>
								<div className="flex space-x-2">
									<Link
										href={`/admin/posts/${post.id}/edit`}
										className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
									>
										編集
									</Link>
									<button
										onClick={() => handleTogglePublish(post.id, post.published)}
										disabled={updatePost.isPending}
										className={`px-3 py-1 text-sm rounded-md ${
											post.published
												? "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
												: "bg-green-100 text-green-800 hover:bg-green-200"
										} disabled:opacity-50`}
									>
										{post.published ? "非公開" : "公開"}
									</button>
									<button
										onClick={() => handleDelete(post.id, post.title)}
										disabled={deletePost.isPending}
										className="px-3 py-1 text-sm bg-red-100 text-red-800 rounded-md hover:bg-red-200 disabled:opacity-50"
									>
										削除
									</button>
								</div>
							</div>
						</div>
					))}
					
					{hasNextPage && (
						<div className="text-center py-4">
							<button
								onClick={() => fetchNextPage()}
								disabled={isFetchingNextPage}
								className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
							>
								{isFetchingNextPage ? "読み込み中..." : "もっと見る"}
							</button>
						</div>
					)}
				</div>
			)}
		</div>
	);
} 