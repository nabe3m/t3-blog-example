"use client";

import Link from "next/link";
import { Suspense } from "react";
import { api } from "~/trpc/react";

function CategoryListContent() {
	const { data: categories, isLoading, isError } = api.category.getAll.useQuery();

	if (isLoading) {
		return <CategoryListSkeleton />;
	}

	if (isError) {
		return (
			<div className="text-red-500 text-sm">
				エラーが発生しました
			</div>
		);
	}

	if (!categories || categories.length === 0) {
		return (
			<div className="text-gray-500 text-sm">
				カテゴリがまだありません。
			</div>
		);
	}

	return (
		<div className="space-y-2">
			{categories.map((category: any) => (
				<div key={category.id}>
					<Link 
						href={`/categories/${category.slug}`}
						className="block text-gray-700 hover:text-blue-600 hover:bg-gray-50 px-2 py-1 rounded transition-colors"
					>
						<div className="flex justify-between items-center">
							<span className="text-sm font-medium">
								{category.name}
							</span>
							<span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
								{category._count.posts}
							</span>
						</div>
					</Link>
				</div>
			))}
		</div>
	);
}

function CategoryListSkeleton() {
	return (
		<div className="space-y-2">
			{[...Array(3)].map((_, i) => (
				<div key={i} className="animate-pulse">
					<div className="h-4 bg-gray-200 rounded w-full mb-1" />
					<div className="h-3 bg-gray-100 rounded w-1/3" />
				</div>
			))}
		</div>
	);
}

export function CategoryList() {
	return (
		<Suspense fallback={<CategoryListSkeleton />}>
			<CategoryListContent />
		</Suspense>
	);
} 