"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "~/trpc/react";
import { useNotifications } from "./notification-context";

interface CategoryFormData {
	name: string;
	slug: string;
	description?: string;
}

interface CategoryFormProps {
	categoryId?: number;
	initialData?: Partial<CategoryFormData>;
}

export function CategoryForm({ categoryId, initialData }: CategoryFormProps) {
	const router = useRouter();
	const utils = api.useUtils();
	const { addNotification } = useNotifications();
	const [formData, setFormData] = useState<CategoryFormData>({
		name: "",
		slug: "",
		description: "",
		...initialData,
	});
	const [errors, setErrors] = useState<Record<string, string>>({});

	// カテゴリの作成・更新
	const createCategory = api.category.create.useMutation({
		onSuccess: async () => {
			await utils.category.invalidate();
			await utils.post.invalidate();
			
			addNotification({
				type: "success",
				title: "カテゴリを作成しました",
				duration: 2000,
			});
			
			setTimeout(() => {
				router.push("/admin/categories");
			}, 2000);
		},
		onError: (error) => {
			addNotification({
				type: "error",
				title: "作成に失敗しました",
			});
		},
	});

	const updateCategory = api.category.update.useMutation({
		onSuccess: async () => {
			await utils.category.invalidate();
			await utils.post.invalidate();
			
			addNotification({
				type: "success",
				title: "カテゴリを更新しました",
			});
		},
		onError: (error) => {
			addNotification({
				type: "error",
				title: "更新に失敗しました",
			});
		},
	});

	// 名前からスラッグを自動生成
	useEffect(() => {
		if (formData.name && !categoryId) {
			const slug = formData.name
				.toLowerCase()
				.replace(/[^a-zA-Z0-9\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/g, "-")
				.replace(/-+/g, "-")
				.replace(/^-|-$/g, "");
			setFormData(prev => ({ ...prev, slug }));
		}
	}, [formData.name, categoryId]);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		setErrors({});

		// バリデーション
		const newErrors: Record<string, string> = {};
		if (!formData.name.trim()) newErrors.name = "カテゴリ名は必須です";
		if (!formData.slug.trim()) newErrors.slug = "スラッグは必須です";

		if (Object.keys(newErrors).length > 0) {
			setErrors(newErrors);
			return;
		}

		const submitData = {
			...formData,
			description: formData.description?.trim() || undefined,
		};

		if (categoryId) {
			updateCategory.mutate({ id: categoryId, ...submitData });
		} else {
			createCategory.mutate(submitData);
		}
	};

	const handleInputChange = (field: keyof CategoryFormData, value: string) => {
		setFormData(prev => ({ ...prev, [field]: value }));
		// エラーをクリア
		if (errors[field]) {
			setErrors(prev => ({ ...prev, [field]: "" }));
		}
	};

	const isLoading = createCategory.isPending || updateCategory.isPending;

	return (
		<form onSubmit={handleSubmit} className="space-y-6">
			{errors.form && (
				<div className="bg-red-50 border border-red-200 rounded-lg p-4">
					<p className="text-red-600">{errors.form}</p>
				</div>
			)}

			{/* カテゴリ名 */}
			<div>
				<label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
					カテゴリ名 *
				</label>
				<input
					type="text"
					id="name"
					value={formData.name}
					onChange={(e) => handleInputChange("name", e.target.value)}
					className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
						errors.name ? "border-red-300" : "border-gray-300"
					}`}
					placeholder="カテゴリ名を入力"
				/>
				{errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
			</div>

			{/* スラッグ */}
			<div>
				<label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-2">
					スラッグ *
				</label>
				<input
					type="text"
					id="slug"
					value={formData.slug}
					onChange={(e) => handleInputChange("slug", e.target.value)}
					className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
						errors.slug ? "border-red-300" : "border-gray-300"
					}`}
					placeholder="url-friendly-slug"
				/>
				{errors.slug && <p className="mt-1 text-sm text-red-600">{errors.slug}</p>}
			</div>

			{/* 説明 */}
			<div>
				<label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
					説明
				</label>
				<textarea
					id="description"
					value={formData.description || ""}
					onChange={(e) => handleInputChange("description", e.target.value)}
					rows={4}
					className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
					placeholder="カテゴリの説明を入力（任意）"
				/>
			</div>

			{/* 送信ボタン */}
			<div className="flex space-x-4">
				<button
					type="submit"
					disabled={isLoading}
					className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
				>
					{isLoading ? "保存中..." : categoryId ? "更新" : "作成"}
				</button>
				<button
					type="button"
					onClick={() => router.back()}
					className="bg-gray-600 text-white px-6 py-2 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
				>
					キャンセル
				</button>
			</div>
		</form>
	);
} 