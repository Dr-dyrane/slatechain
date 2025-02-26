import type * as React from "react"
import { NotificationCard } from "../ui/NotificationCard"
import type { Notification } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Check, BellOff } from "lucide-react"
import { useDispatch } from "react-redux"
import type { AppDispatch } from "@/lib/store"
import { markAllNotificationsAsRead } from "@/lib/slices/notificationSlice"

interface Props {
  notifications: Notification[]
}

export const RightBar: React.FC<Props> = ({ notifications }) => {
  const dispatch = useDispatch<AppDispatch>()
  const hasUnread = Array.isArray(notifications) && notifications.some((notification) => !notification.read);

  const handleMarkAllAsRead = () => {
    dispatch(markAllNotificationsAsRead())
  }

  return (
    <div className="hidden xl:block w-80 2xl:w-96 p-4 bg-background">
      <div className="px-4 pb-2 flex justify-between flex-wrap gap-2 items-center">
        <div className="text-lg text-left font-semibold">Notifications</div>
        {hasUnread && (
          <Button variant="outline" size="sm" className="h-8" onClick={handleMarkAllAsRead}>
            <Check className="h-4 w-4 mr-1" />
            Mark all as read
          </Button>
        )}
      </div>
      <div className="divide-y divide-border space-y-4 px-4 pb-4 mt-2 max-h-[calc(100vh-8rem)] overflow-y-auto">
        {notifications.length > 0 ? (
          notifications.map((notification) => <NotificationCard key={notification.id} notification={notification} />)
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

