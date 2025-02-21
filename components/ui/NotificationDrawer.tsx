import * as React from "react";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
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
            <SheetContent
                className="sm:max-w-sm max-h-screen border-none shadow-lg rounded-l-2xl p-0 overflow-y-scroll scrollbar-hide backdrop-blur-md bg-background/85"
                side="right"
            >
                <SheetHeader className="px-4 pt-4 pb-2">
                    <SheetTitle className="text-lg text-left font-semibold">
                        Notifications
                    </SheetTitle>
                </SheetHeader>
                <div className="divide-y divide-border space-y-4 px-4 pb-4 mt-2">
                    {notifications.length > 0 ? (
                        notifications.map((notification) => (
                            <NotificationCard
                                key={notification.id}
                                notification={notification}
                            />
                        ))
                    ) : (
                        <p className="text-muted-foreground text-sm text-center py-4">
                            No new notifications
                        </p>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    );
};