"use client"

import type * as React from "react"
import { NotificationCard } from "../ui/NotificationCard"
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

interface Props {
  notifications: Notification[]
}

export const RightBar: React.FC<Props> = ({ notifications }) => {
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
    <div className="hidden xl:block w-80 2xl:w-96 p-4 bg-background">
      <div className="px-4 pb-2 flex justify-between flex-wrap gap-2 items-center">
        <div className="text-lg text-left font-semibold">Notifications</div>
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
      <div className="divide-y divide-border space-y-4 px-4 pb-[6.5rem] mt-2 max-h-[calc(100vh-8rem)] overflow-y-auto scrollbar-hide">
        {notifications.length > 0 ? (
          notifications.map((notification, index) => <NotificationCard key={index} notification={notification} />)
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <BellOff className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-sm mb-2">No new notifications</p>
            <p className="text-xs text-muted-foreground">You'll see notifications here when there are updates</p>
          </div>
        )}
      </div>
    </div>
  )
}

