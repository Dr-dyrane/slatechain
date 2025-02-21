import * as React from "react"
import { NotificationCard } from "../ui/NotificationCard"
import { Notification } from "@/lib/types";

interface Props {
  notifications: Notification[];
}

export const RightBar: React.FC<Props> = ({
  notifications,
}) => {
  return (
    <div className="hidden xl:block w-80 2xl:w-96 p-4 bg-background">
      <div className="px-4 pb-2">
        <div className="text-lg text-left font-semibold">
          Notifications
        </div>
      </div>
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
    </div>
  )
}

