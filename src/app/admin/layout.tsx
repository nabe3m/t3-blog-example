import { NotificationProvider } from "~/app/_components/admin/notification-context";
import { NotificationContainer } from "~/app/_components/admin/notification-container";

export default function AdminLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<NotificationProvider>
			{children}
			<NotificationContainer />
		</NotificationProvider>
	);
} 