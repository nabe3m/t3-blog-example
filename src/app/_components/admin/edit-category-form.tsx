"use client";

import { api } from "~/trpc/react";
import { CategoryForm } from "./category-form";

interface EditCategoryFormProps {
	categoryId: number;
}

export function EditCategoryForm({ categoryId }: EditCategoryFormProps) {
	const { data: category, isLoading, error } = api.category.getById.useQuery({ id: categoryId });

	if (isLoading) {
		return (
			<div className="space-y-6 animate-pulse">
				<div className="h-10 bg-gray-200 rounded" />
				<div className="h-10 bg-gray-200 rounded" />
				<div className="h-24 bg-gray-200 rounded" />
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

	if (!category) {
		return (
			<div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
				<p className="text-yellow-600">カテゴリが見つかりません。</p>
			</div>
		);
	}

	return (
		<CategoryForm
			categoryId={categoryId}
			initialData={{
				name: category.name,
				slug: category.slug,
				description: category.description || "",
			}}
		/>
	);
} 