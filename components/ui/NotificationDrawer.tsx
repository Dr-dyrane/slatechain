// src/components/ui/NotificationDrawer.tsx
import * as React from "react";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";
import { NotificationCard } from "@/components/ui/NotificationCard";
import { Notification } from "@/lib/types";

interface NotificationDrawerProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	notifications: Notification[];
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
	open,
	onOpenChange,
	notifications,
}) => {
	return (
		<Sheet open={open} onOpenChange={onOpenChange}>
			<SheetContent className="sm:max-w-sm" side="right">
				<SheetHeader>
					<SheetTitle>Notifications</SheetTitle>
				</SheetHeader>
				<div className="divide-y divide-border space-y-2">
					{notifications.map((notification) => (
						<NotificationCard
							key={notification.id}
							notification={notification}
							onClick={() => {
								console.log("Mobile Notification Clicked", notification.id);
								onOpenChange(false); // Close the drawer
								// Handle mobile notification click (e.g., navigate to details)
							}}
						/>
					))}
				</div>
			</SheetContent>
		</Sheet>
	);
};