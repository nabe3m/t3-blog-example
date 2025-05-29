"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import { useNotifications } from "~/app/_components/admin/notification-context";

export function ProfileForm() {
	const { data: profile, isLoading } = api.profile.get.useQuery();
	const updateProfile = api.profile.update.useMutation();
	const { addNotification } = useNotifications();
	const utils = api.useUtils();

	const [formData, setFormData] = useState({
		name: "",
		bio: "",
		website: "",
		twitter: "",
		github: "",
	});

	const [isFormInitialized, setIsFormInitialized] = useState(false);

	// プロフィール取得完了時にフォームを初期化
	if (profile && !isFormInitialized) {
		setFormData({
			name: profile.name || "",
			bio: profile.bio || "",
			website: profile.website || "",
			twitter: profile.twitter || "",
			github: profile.github || "",
		});
		setIsFormInitialized(true);
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		try {
			await updateProfile.mutateAsync(formData);
			await utils.profile.get.invalidate();
			
			// 成功通知
			console.log("Adding success notification");
			addNotification({
				type: "success",
				title: "成功",
				message: "プロフィールを更新しました",
				duration: 3000,
			});
		} catch (error) {
			console.error("Profile update error:", error);
			
			// エラー通知
			console.log("Adding error notification");
			addNotification({
				type: "error",
				title: "エラー",
				message: "プロフィールの更新に失敗しました",
				duration: 5000,
			});
		}
	};

	const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		const { name, value } = e.target;
		setFormData(prev => ({
			...prev,
			[name]: value,
		}));
	};

	if (isLoading) {
		return (
			<div className="flex items-center justify-center p-8">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
			</div>
		);
	}

	return (
		<form onSubmit={handleSubmit} className="space-y-6">
			{/* 基本情報 */}
			<div className="bg-white p-6 rounded-lg border border-gray-200">
				<h3 className="text-lg font-medium text-gray-900 mb-4">基本情報</h3>
				
				<div className="grid grid-cols-1 gap-6">
					{/* 名前 */}
					<div>
						<label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
							名前 <span className="text-red-500">*</span>
						</label>
						<input
							type="text"
							id="name"
							name="name"
							value={formData.name}
							onChange={handleChange}
							required
							className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
							placeholder="あなたの名前"
						/>
					</div>

					{/* メールアドレス（読み取り専用） */}
					<div>
						<label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
							メールアドレス
						</label>
						<input
							type="email"
							id="email"
							value={profile?.email || ""}
							readOnly
							className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
						/>
						<p className="text-sm text-gray-500 mt-1">
							メールアドレスは変更できません
						</p>
					</div>

					{/* 自己紹介 */}
					<div>
						<label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
							自己紹介
						</label>
						<textarea
							id="bio"
							name="bio"
							value={formData.bio}
							onChange={handleChange}
							rows={4}
							className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
							placeholder="あなたについて簡単に教えてください"
						/>
						<p className="text-sm text-gray-500 mt-1">
							500文字以内で入力してください
						</p>
					</div>
				</div>
			</div>

			{/* ソーシャルリンク */}
			<div className="bg-white p-6 rounded-lg border border-gray-200">
				<h3 className="text-lg font-medium text-gray-900 mb-4">ソーシャルリンク</h3>
				
				<div className="grid grid-cols-1 gap-6">
					{/* ウェブサイト */}
					<div>
						<label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-2">
							ウェブサイト
						</label>
						<input
							type="url"
							id="website"
							name="website"
							value={formData.website}
							onChange={handleChange}
							className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
							placeholder="https://example.com"
						/>
					</div>

					{/* X (旧Twitter) */}
					<div>
						<label htmlFor="twitter" className="block text-sm font-medium text-gray-700 mb-2">
							X (旧Twitter)
						</label>
						<div className="flex">
							<span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
								@
							</span>
							<input
								type="text"
								id="twitter"
								name="twitter"
								value={formData.twitter}
								onChange={handleChange}
								className="flex-1 px-3 py-2 border border-gray-300 rounded-r-lg focus:ring-blue-500 focus:border-blue-500"
								placeholder="username"
							/>
						</div>
					</div>

					{/* GitHub */}
					<div>
						<label htmlFor="github" className="block text-sm font-medium text-gray-700 mb-2">
							GitHub
						</label>
						<div className="flex">
							<span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
								github.com/
							</span>
							<input
								type="text"
								id="github"
								name="github"
								value={formData.github}
								onChange={handleChange}
								className="flex-1 px-3 py-2 border border-gray-300 rounded-r-lg focus:ring-blue-500 focus:border-blue-500"
								placeholder="username"
							/>
						</div>
					</div>
				</div>
			</div>

			{/* 送信ボタン */}
			<div className="flex justify-end">
				<button
					type="submit"
					disabled={updateProfile.isPending}
					className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
				>
					{updateProfile.isPending ? "更新中..." : "変更を保存"}
				</button>
			</div>
		</form>
	);
} 