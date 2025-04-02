"use client"

import type * as React from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { NotificationCard } from "@/components/ui/NotificationCard"
import type { Notification } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Check, BellOff, Trash2, RefreshCw } from "lucide-react"
import { useDispatch, useSelector } from "react-redux"
import type { AppDispatch, RootState } from "@/lib/store"
import { markAllNotificationsAsRead, deleteAllNotifications } from "@/lib/slices/notificationSlice"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface NotificationDrawerProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    notifications: Notification[]
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({ open, onOpenChange, notifications }) => {
    const dispatch = useDispatch<AppDispatch>()
    const { isDeletingAll } = useSelector((state: RootState) => state.notifications)
    const hasUnread = Array.isArray(notifications) && notifications.some((notification) => !notification.read)
    const hasNotifications = Array.isArray(notifications) && notifications.length > 0

    const handleMarkAllAsRead = () => {
        dispatch(markAllNotificationsAsRead())
    }

    const handleDeleteAll = () => {
        dispatch(deleteAllNotifications())
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
                        <div className="flex items-center gap-2">
                            {hasUnread && (
                                <Button variant="outline" size="sm" className="h-8" onClick={handleMarkAllAsRead}>
                                    <Check className="h-4 w-4 mr-1" />
                                    <span className="text-xs hidden sm:block">Mark all read</span>
                                </Button>
                            )}
                            {hasNotifications && (
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="outline" size="sm" className="h-8" disabled={isDeletingAll}>
                                            {isDeletingAll ? (
                                                <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                                            ) : (
                                                <Trash2 className="h-4 w-4 mr-1" />
                                            )}
                                            {
                                                isDeletingAll ?
                                                    <span className="text-xs hidden sm:block">Deleting...</span>
                                                    : <span className="text-xs hidden sm:block">Clear all</span>
                                            }
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Delete all notifications?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                This action cannot be undone. All notifications will be permanently deleted.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={handleDeleteAll}>Delete All</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            )}
                        </div>
                    </div>
                </SheetHeader>
                <div className="divide-y divide-border space-y-4 px-4 pb-[3.5rem] mt-2 max-h-[90vh] overflow-y-scroll scrollbar-hide">
                    {notifications.length > 0 ? (
                        notifications.map((notification, index) => <NotificationCard key={index} notification={notification} />)
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

