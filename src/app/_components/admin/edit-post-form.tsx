"use client";

import { api } from "~/trpc/react";
import { PostForm } from "./post-form";

interface EditPostFormProps {
	postId: number;
}

export function EditPostForm({ postId }: EditPostFormProps) {
	const { data: post, isLoading, error } = api.post.getById.useQuery({ id: postId });

	if (isLoading) {
		return (
			<div className="space-y-6 animate-pulse">
				<div className="h-10 bg-gray-200 rounded" />
				<div className="h-10 bg-gray-200 rounded" />
				<div className="h-24 bg-gray-200 rounded" />
				<div className="h-40 bg-gray-200 rounded" />
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

	if (!post) {
		return (
			<div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
				<p className="text-yellow-600">記事が見つかりません。</p>
			</div>
		);
	}

	// 型安全性のための型アサーション
	const article = post;

	return (
		<PostForm
			key={`${postId}-${article.updatedAt}`}
			postId={postId}
			initialData={{
				title: article.title,
				content: article.content,
				excerpt: article.excerpt || "",
				featuredImage: article.featuredImage || "",
				categoryIds: article.categories?.map((cat) => cat.category.id) || [],
				published: article.published,
			}}
		/>
	);
} 