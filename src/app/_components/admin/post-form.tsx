"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "~/trpc/react";
import { useNotifications } from "./notification-context";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import type { Category, PostFormData } from "~/types";

interface PostFormProps {
	postId?: number;
	initialData?: Partial<PostFormData>;
}

// 絵文字の選択肢
const EMOJI_OPTIONS = [
	"📝", "💡", "🚀", "✨", "🎯", "💭", "🌟", "🔥", "⭐", "💖",
	"🎨", "📚", "💻", "🎵", "🍕", "☕", "🌈", "🦄", "🎪", "🎭",
	"🌸", "🌺", "🌻", "🌷", "🌹", "🌊", "🗽", "🎂", "🎁", "🎊",
	"📱", "⚡", "🔮", "🎲", "🎪", "🎨", "🎬", "📸", "🎮", "🎯",
	"🚗", "✈️", "🏠", "🌍", "🌙", "☀️", "⛅", "🌤️", "🌈", "❄️"
];

export function PostForm({ postId, initialData }: PostFormProps) {
	const router = useRouter();
	const utils = api.useUtils();
	const { addNotification } = useNotifications();
	const [formData, setFormData] = useState<PostFormData>({
		title: "",
		content: "",
		excerpt: "",
		featuredImage: "",
		categoryIds: [],
		published: false,
		...initialData,
	});
	const [errors, setErrors] = useState<Record<string, string>>({});
	const [selectedEmoji, setSelectedEmoji] = useState<string>(
		initialData?.featuredImage || ""
	);
	const [previewMode, setPreviewMode] = useState<"edit" | "preview" | "split">("edit");
	const [categorySearch, setCategorySearch] = useState("");
	const [showCategorySuggestions, setShowCategorySuggestions] = useState(false);

	// カテゴリ一覧を取得
	const { data: categories } = api.category.getAll.useQuery();

	// フィルタリングされたカテゴリリスト
	const filteredCategories = categories?.filter((category: Category) =>
		category.name.toLowerCase().includes(categorySearch.toLowerCase()) ||
		category.description?.toLowerCase().includes(categorySearch.toLowerCase())
	) || [];

	// 選択されているカテゴリの詳細情報
	const selectedCategories = categories?.filter((category: Category) =>
		formData.categoryIds.includes(category.id)
	) || [];

	// 記事の作成・更新
	const createPost = api.post.create.useMutation({
		onSuccess: async () => {
			// キャッシュを無効化
			await utils.post.invalidate();
			await utils.category.invalidate();
			
			// 成功通知を表示
			addNotification({
				type: "success",
				title: "記事を作成しました",
				duration: 2000,
			});
			
			setErrors({}); // エラーをクリア
			
			// 2秒後に管理画面にリダイレクト
			setTimeout(() => {
				router.push("/admin/posts");
			}, 2000);
		},
		onError: (error) => {
			addNotification({
				type: "error",
				title: error.message,
			});
		},
	});

	const updatePost = api.post.update.useMutation({
		onSuccess: async () => {
			// キャッシュを無効化
			await utils.post.invalidate();
			await utils.category.invalidate();
			
			// 成功通知を表示
			addNotification({
				type: "success",
				title: "記事を更新しました",
			});
			
			setErrors({}); // エラーをクリア
		},
		onError: (error) => {
			addNotification({
				type: "error",
				title: error.message,
			});
		},
	});

	// 絵文字選択時にfeaturedImageを更新
	useEffect(() => {
		setFormData(prev => ({ ...prev, featuredImage: selectedEmoji }));
	}, [selectedEmoji]);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		setErrors({});

		// バリデーション
		const newErrors: Record<string, string> = {};
		if (!formData.title.trim()) newErrors.title = "タイトルは必須です";
		if (!formData.content.trim()) newErrors.content = "本文は必須です";

		if (Object.keys(newErrors).length > 0) {
			setErrors(newErrors);
			return;
		}

		const submitData = {
			...formData,
			categoryIds: formData.categoryIds.length > 0 ? formData.categoryIds : undefined,
			featuredImage: selectedEmoji || undefined,
		};

		if (postId) {
			updatePost.mutate({ id: postId, ...submitData });
		} else {
			createPost.mutate(submitData);
		}
	};

	const handleInputChange = (field: keyof PostFormData, value: string | number | boolean | number[] | undefined) => {
		setFormData(prev => ({ ...prev, [field]: value }));
		// エラーをクリア
		if (errors[field]) {
			setErrors(prev => ({ ...prev, [field]: "" }));
		}
	};

	// カテゴリ選択のハンドラー
	const handleCategoryToggle = (categoryId: number) => {
		const currentIds = formData.categoryIds;
		const newIds = currentIds.includes(categoryId)
			? currentIds.filter(id => id !== categoryId)
			: [...currentIds, categoryId];
		handleInputChange("categoryIds", newIds);
	};

	// カテゴリ選択（サジェストから）
	const handleCategorySelect = (categoryId: number) => {
		if (!formData.categoryIds.includes(categoryId)) {
			handleInputChange("categoryIds", [...formData.categoryIds, categoryId]);
		}
		setCategorySearch("");
		setShowCategorySuggestions(false);
	};

	// カテゴリ削除
	const handleCategoryRemove = (categoryId: number) => {
		handleInputChange("categoryIds", formData.categoryIds.filter(id => id !== categoryId));
	};

	// 検索フィールドのハンドラー
	const handleCategorySearchChange = (value: string) => {
		setCategorySearch(value);
		setShowCategorySuggestions(value.length > 0);
	};

	const isLoading = createPost.isPending || updatePost.isPending;

	return (
		<form onSubmit={handleSubmit} className="space-y-6">
			{/* タイトル */}
			<div>
				<label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
					タイトル *
				</label>
				<input
					type="text"
					id="title"
					value={formData.title}
					onChange={(e) => handleInputChange("title", e.target.value)}
					className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
						errors.title ? "border-red-300" : "border-gray-300"
					}`}
					placeholder="記事のタイトルを入力"
				/>
				{errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
			</div>

			{/* カテゴリ（検索とサジェスト選択） */}
			<div>
				<label className="block text-sm font-medium text-gray-700 mb-2">
					カテゴリ（検索して選択）
				</label>
				
				{/* 選択されたカテゴリの表示 */}
				{selectedCategories.length > 0 && (
					<div className="mb-3">
						<div className="flex flex-wrap gap-2">
							{selectedCategories.map((category: Category) => (
								<span
									key={category.id}
									className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
								>
									{category.name}
									<button
										type="button"
										onClick={() => handleCategoryRemove(category.id)}
										className="ml-2 text-blue-600 hover:text-blue-800 focus:outline-none"
									>
										<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
										</svg>
									</button>
								</span>
							))}
						</div>
					</div>
				)}

				{/* 検索入力フィールド */}
				<div className="relative">
					<input
						type="text"
						value={categorySearch}
						onChange={(e) => handleCategorySearchChange(e.target.value)}
						onFocus={() => setShowCategorySuggestions(categorySearch.length > 0)}
						onBlur={() => {
							// 少し遅延させてサジェストをクリックできるようにする
							setTimeout(() => setShowCategorySuggestions(false), 200);
						}}
						className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
						placeholder="カテゴリ名を検索..."
					/>
					
					{/* サジェストリスト */}
					{showCategorySuggestions && filteredCategories.length > 0 && (
						<div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
							{filteredCategories
								.filter((category: Category) => !formData.categoryIds.includes(category.id))
								.map((category: Category) => (
									<button
										key={category.id}
										type="button"
										onClick={() => handleCategorySelect(category.id)}
										className="w-full px-4 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
									>
										<div className="font-medium text-gray-900">{category.name}</div>
										{category.description && (
											<div className="text-sm text-gray-500">{category.description}</div>
										)}
									</button>
								))
							}
							{filteredCategories.filter((category: Category) => !formData.categoryIds.includes(category.id)).length === 0 && (
								<div className="px-4 py-2 text-gray-500 text-sm">
									選択可能なカテゴリがありません
								</div>
							)}
						</div>
					)}

					{/* 検索結果が0件の場合 */}
					{showCategorySuggestions && categorySearch.length > 0 && filteredCategories.length === 0 && (
						<div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
							<div className="px-4 py-2 text-gray-500 text-sm">
								「{categorySearch}」に一致するカテゴリがありません
							</div>
						</div>
					)}
				</div>

				{/* ヘルプテキスト */}
				<p className="mt-2 text-sm text-gray-500">
					{categories && categories.length > 0 
						? `${categories.length}個のカテゴリから選択できます。複数選択可能です。`
						: "カテゴリがまだ作成されていません。"
					}
				</p>
			</div>

			{/* アイキャッチ絵文字 */}
			<div>
				<label className="block text-sm font-medium text-gray-700 mb-2">
					アイキャッチ絵文字
				</label>
				<div className="space-y-3">
					{/* 現在選択されている絵文字のプレビュー */}
					<div className="flex items-center space-x-3">
						<div className="text-4xl bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-4 w-20 h-20 flex items-center justify-center">
							{selectedEmoji || "🎨"}
						</div>
						<div>
							<p className="text-sm text-gray-600">
								{selectedEmoji ? "選択されています" : "絵文字を選択してください"}
							</p>
							{selectedEmoji && (
								<button
									type="button"
									onClick={() => setSelectedEmoji("")}
									className="text-sm text-red-600 hover:text-red-700"
								>
									クリア
								</button>
							)}
						</div>
					</div>

					{/* 絵文字選択グリッド */}
					<div className="grid grid-cols-10 gap-2 p-4 bg-gray-50 rounded-lg max-h-64 overflow-y-auto">
						{EMOJI_OPTIONS.map((emoji, index) => (
							<button
								key={index}
								type="button"
								onClick={() => setSelectedEmoji(emoji)}
								className={`text-2xl p-2 rounded-md hover:bg-gray-200 transition-colors ${
									selectedEmoji === emoji 
										? "bg-blue-100 border-2 border-blue-500" 
										: "bg-white border border-gray-200"
								}`}
							>
								{emoji}
							</button>
						))}
					</div>
				</div>
			</div>

			{/* 抜粋 */}
			<div>
				<label htmlFor="excerpt" className="block text-sm font-medium text-gray-700 mb-2">
					抜粋
				</label>
				<textarea
					id="excerpt"
					value={formData.excerpt}
					onChange={(e) => handleInputChange("excerpt", e.target.value)}
					rows={3}
					className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
					placeholder="記事の概要を入力"
				/>
			</div>

			{/* 本文 */}
			<div>
				<div className="flex items-center justify-between mb-2">
					<label htmlFor="content" className="block text-sm font-medium text-gray-700">
						本文 *
					</label>
					<div className="flex space-x-2">
						<button
							type="button"
							onClick={() => setPreviewMode("edit")}
							className={`px-3 py-1 text-sm rounded ${
								previewMode === "edit"
									? "bg-blue-600 text-white"
									: "bg-gray-200 text-gray-700 hover:bg-gray-300"
							}`}
						>
							編集
						</button>
						<button
							type="button"
							onClick={() => setPreviewMode("split")}
							className={`px-3 py-1 text-sm rounded ${
								previewMode === "split"
									? "bg-blue-600 text-white"
									: "bg-gray-200 text-gray-700 hover:bg-gray-300"
							}`}
						>
							分割
						</button>
						<button
							type="button"
							onClick={() => setPreviewMode("preview")}
							className={`px-3 py-1 text-sm rounded ${
								previewMode === "preview"
									? "bg-blue-600 text-white"
									: "bg-gray-200 text-gray-700 hover:bg-gray-300"
							}`}
						>
							プレビュー
						</button>
					</div>
				</div>

				{previewMode === "edit" && (
					<textarea
						id="content"
						value={formData.content}
						onChange={(e) => handleInputChange("content", e.target.value)}
						rows={15}
						className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
							errors.content ? "border-red-300" : "border-gray-300"
						}`}
						placeholder="記事の本文を入力（Markdownで記述できます）"
					/>
				)}

				{previewMode === "preview" && (
					<div className="min-h-[400px] border border-gray-300 rounded-md p-4 bg-white">
						{formData.content ? (
							<div className="markdown-content">
								<ReactMarkdown
									remarkPlugins={[remarkGfm]}
									rehypePlugins={[rehypeHighlight]}
								>
									{formData.content}
								</ReactMarkdown>
							</div>
						) : (
							<p className="text-gray-500 italic">プレビューするには本文を入力してください</p>
						)}
					</div>
				)}

				{previewMode === "split" && (
					<div className="grid grid-cols-2 gap-4">
						<div>
							<h4 className="text-sm font-medium text-gray-700 mb-2">編集</h4>
							<textarea
								id="content"
								value={formData.content}
								onChange={(e) => handleInputChange("content", e.target.value)}
								rows={15}
								className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
									errors.content ? "border-red-300" : "border-gray-300"
								}`}
								placeholder="記事の本文を入力（Markdownで記述できます）"
							/>
						</div>
						<div>
							<h4 className="text-sm font-medium text-gray-700 mb-2">プレビュー</h4>
							<div className="min-h-[400px] border border-gray-300 rounded-md p-4 bg-white overflow-y-auto">
								{formData.content ? (
									<div className="markdown-content">
										<ReactMarkdown
											remarkPlugins={[remarkGfm]}
											rehypePlugins={[rehypeHighlight]}
										>
											{formData.content}
										</ReactMarkdown>
									</div>
								) : (
									<p className="text-gray-500 italic">プレビューするには本文を入力してください</p>
								)}
							</div>
						</div>
					</div>
				)}

				{errors.content && <p className="mt-1 text-sm text-red-600">{errors.content}</p>}
				<p className="mt-2 text-sm text-gray-500">
					Markdownで記述できます。編集モード・分割モード・プレビューモードを切り替えて確認できます。
				</p>
			</div>

			{/* 公開設定 */}
			{!(postId && initialData?.published) && (
				<div className="flex items-center">
					<input
						type="checkbox"
						id="published"
						checked={formData.published}
						onChange={(e) => handleInputChange("published", e.target.checked)}
						className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
					/>
					<label htmlFor="published" className="ml-2 block text-sm text-gray-900">
						すぐに公開する
					</label>
				</div>
			)}

			{/* 編集時で既に公開されている場合の表示 */}
			{postId && initialData?.published && (
				<div className="bg-green-50 border border-green-200 rounded-lg p-4">
					<div className="flex items-center">
						<svg className="w-5 h-5 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
							<path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
						</svg>
						<span className="text-sm font-medium text-green-800">この記事は公開済みです</span>
					</div>
					<p className="mt-1 text-sm text-green-700">
						更新内容は保存と同時に公開サイトに反映されます。
					</p>
				</div>
			)}

			{/* 送信ボタン */}
			<div className="flex space-x-4">
				<button
					type="submit"
					disabled={isLoading}
					className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
				>
					{isLoading ? "保存中..." : postId ? "更新" : "作成"}
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