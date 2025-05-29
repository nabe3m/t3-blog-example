import { useNotifications } from "./notification-context";

export function useNotificationHelpers() {
	const { addNotification } = useNotifications();

	const notifySuccess = (message: string, title = "成功") => {
		addNotification({
			type: "success",
			title,
			message,
		});
	};

	const notifyError = (message: string, title = "エラー") => {
		addNotification({
			type: "error",
			title,
			message,
		});
	};

	const notifyInfo = (message: string, title = "情報") => {
		addNotification({
			type: "info",
			title,
			message,
		});
	};

	const notifyMutationSuccess = (operation: string) => {
		const messages = {
			create: "正常に作成されました",
			update: "正常に更新されました",
			delete: "正常に削除されました",
			publish: "公開しました",
			unpublish: "非公開にしました",
		};

		notifySuccess(messages[operation as keyof typeof messages] || "操作が完了しました");
	};

	const notifyMutationError = (error: any, operation = "操作") => {
		notifyError(error.message || `${operation}中にエラーが発生しました`);
	};

	return {
		notifySuccess,
		notifyError,
		notifyInfo,
		notifyMutationSuccess,
		notifyMutationError,
	};
} 