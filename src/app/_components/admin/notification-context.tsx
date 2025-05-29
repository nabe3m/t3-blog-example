"use client";

import React, { createContext, useContext, useState, useCallback } from "react";

export type NotificationType = "success" | "error" | "info";

export interface Notification {
	id: string;
	type: NotificationType;
	title: string;
	message?: string;
	duration?: number; // ミリ秒、undefinedの場合は自動削除しない
}

interface NotificationContextType {
	notifications: Notification[];
	addNotification: (notification: Omit<Notification, "id">) => void;
	removeNotification: (id: string) => void;
	clearAllNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function useNotifications() {
	const context = useContext(NotificationContext);
	if (context === undefined) {
		throw new Error("useNotifications must be used within a NotificationProvider");
	}
	return context;
}

interface NotificationProviderProps {
	children: React.ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
	const [notifications, setNotifications] = useState<Notification[]>([]);

	const addNotification = useCallback((notification: Omit<Notification, "id">) => {
		const id = Math.random().toString(36).substr(2, 9);
		const newNotification: Notification = {
			...notification,
			id,
			duration: notification.duration ?? 5000, // デフォルト5秒
		};

		setNotifications(prev => [...prev, newNotification]);

		// 自動削除
		if (newNotification.duration && newNotification.duration > 0) {
			setTimeout(() => {
				removeNotification(id);
			}, newNotification.duration);
		}
	}, []);

	const removeNotification = useCallback((id: string) => {
		setNotifications(prev => prev.filter(notification => notification.id !== id));
	}, []);

	const clearAllNotifications = useCallback(() => {
		setNotifications([]);
	}, []);

	const value = {
		notifications,
		addNotification,
		removeNotification,
		clearAllNotifications,
	};

	return (
		<NotificationContext.Provider value={value}>
			{children}
		</NotificationContext.Provider>
	);
} 