// src/components/ui/NotificationCard.tsx
import React from "react";
import { Notification, NotificationType } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
	Bell,
	Package,
	Activity,
	Users,
	ArrowRight,
	Zap,
} from "lucide-react";

interface NotificationCardProps {
	notification: Notification;
	onClick?: () => void; // Optional function to handle click
}

const iconMap: Record<NotificationType, React.ComponentType<{ className?: string }>> = {
	GENERAL: Bell,
	ORDER_UPDATE: Package,
	INVENTORY_ALERT: Activity,
	INTEGRATION_STATUS: Users,
};

export const NotificationCard: React.FC<NotificationCardProps> = ({
	notification,
	onClick,
}) => {
	const Icon = iconMap[notification.type] || Bell;
	return (
		<button
			onClick={onClick}
			className={cn(
				"group bg-card p-4 rounded-md shadow-sm hover:bg-card/80 transition-colors duration-200 w-full flex items-center justify-between",
				notification.read ? "opacity-75" : "opacity-100"
			)}
		>
			<div className="flex items-center space-x-3">
				<div className="flex-shrink-0">
					<Icon className="h-6 w-6 text-primary" />
				</div>
				<div>
					<p className="text-sm font-medium leading-none">{notification.message}</p>
					<p className="text-xs text-muted-foreground">
						{new Date(notification.createdAt).toLocaleDateString()}
					</p>
				</div>
			</div>
			<ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-secondary-foreground transition-colors duration-200" />
		</button>
	);
};