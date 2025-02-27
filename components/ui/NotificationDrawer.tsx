import type * as React from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { NotificationCard } from "@/components/ui/NotificationCard"
import type { Notification } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Check, BellOff } from "lucide-react"
import { useDispatch } from "react-redux"
import type { AppDispatch } from "@/lib/store"
import { markAllNotificationsAsRead } from "@/lib/slices/notificationSlice"

interface NotificationDrawerProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    notifications: Notification[]
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({ open, onOpenChange, notifications }) => {
    const dispatch = useDispatch<AppDispatch>()
    const hasUnread = Array.isArray(notifications) && notifications.some((notification) => !notification.read);

    const handleMarkAllAsRead = () => {
        dispatch(markAllNotificationsAsRead())
    }

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent
                className="sm:max-w-sm xl:hidden overflow-hidden border-none shadow-lg rounded-l-2xl p-0 backdrop-blur-md bg-background/85"
                side="right"
            >
                <SheetHeader className="px-4 pt-4 pb-2">
                    <div className="flex justify-start items-center gap-4 flex-wrap">
                        <SheetTitle className="text-lg text-left font-semibold">Notifications</SheetTitle>
                        {hasUnread && (
                            <Button variant="outline" size="sm" className="h-8" onClick={handleMarkAllAsRead}>
                                <Check className="h-4 w-4 mr-1" />
                                Mark all as read
                            </Button>
                        )}
                    </div>
                </SheetHeader>
                <div className="divide-y divide-border space-y-4 px-4 pb-4 my-2 max-h-[90vh] overflow-y-scroll scrollbar-hide">
                    {notifications.length > 0 ? (
                        notifications.map((notification) => <NotificationCard key={notification.id} notification={notification} />)
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <BellOff className="h-12 w-12 text-muted-foreground mb-4" />
                            <p className="text-muted-foreground text-sm mb-2">No notifications</p>
                            <p className="text-xs text-muted-foreground">You'll see notifications here when there are updates</p>
                        </div>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    )
}

