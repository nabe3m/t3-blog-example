"use client";

import { useNotifications, type Notification } from "./notification-context";

function NotificationItem({ notification }: { notification: Notification }) {
	const { removeNotification } = useNotifications();

	const getNotificationStyles = (type: Notification["type"]) => {
		switch (type) {
			case "success":
				return {
					bg: "bg-green-50",
					border: "border-green-200",
					text: "text-green-700",
					icon: "text-green-400",
				};
			case "error":
				return {
					bg: "bg-red-50",
					border: "border-red-200",
					text: "text-red-700",
					icon: "text-red-400",
				};
			case "info":
				return {
					bg: "bg-blue-50",
					border: "border-blue-200",
					text: "text-blue-700",
					icon: "text-blue-400",
				};
		}
	};

	const getIcon = (type: Notification["type"]) => {
		switch (type) {
			case "success":
				return (
					<svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
						<path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
					</svg>
				);
			case "error":
				return (
					<svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
						<path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
					</svg>
				);
			case "info":
				return (
					<svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
						<path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
					</svg>
				);
		}
	};

	const styles = getNotificationStyles(notification.type);

	// メッセージがある場合はメッセージのみ、なければタイトルを表示
	const displayText = notification.message || notification.title;

	return (
		<div
			className={`${styles.bg} ${styles.border} border rounded-lg p-3 shadow-lg transition-all duration-300 ease-in-out transform max-w-sm w-full`}
		>
			<div className="flex items-center">
				<div className={`flex-shrink-0 ${styles.icon}`}>
					{getIcon(notification.type)}
				</div>
				<div className="ml-3 flex-1">
					<p className={`text-sm font-medium ${styles.text}`}>
						{displayText}
					</p>
				</div>
				<div className="ml-4 flex-shrink-0">
					<button
						type="button"
						onClick={() => removeNotification(notification.id)}
						className={`inline-flex rounded-md ${styles.bg} ${styles.text} hover:${styles.text.replace('700', '600')} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-green-50 focus:ring-green-600`}
					>
						<span className="sr-only">閉じる</span>
						<svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
							<path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
						</svg>
					</button>
				</div>
			</div>
		</div>
	);
}

export function NotificationContainer() {
	const { notifications } = useNotifications();

	if (notifications.length === 0) {
		return null;
	}

	return (
		<div className="fixed top-4 right-4 z-50 space-y-4">
			{notifications.map((notification) => (
				<NotificationItem key={notification.id} notification={notification} />
			))}
		</div>
	);
} 