"use client"

import type React from "react"
import { useState } from "react"
import type { Notification, NotificationType } from "@/lib/types"
import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import { Bell, Package, Activity, Users, X, Check } from "lucide-react"
import { useDispatch } from "react-redux"
import type { AppDispatch } from "@/lib/store"
import { markNotificationAsRead, deleteNotification } from "@/lib/slices/notificationSlice"
import { Button } from "@/components/ui/button"

interface NotificationCardProps {
    notification: Notification
}

const iconMap: Record<NotificationType, React.ComponentType<{ className?: string }>> = {
    GENERAL: Bell,
    ORDER_UPDATE: Package,
    INVENTORY_ALERT: Activity,
    INTEGRATION_STATUS: Users,
}

export const NotificationCard: React.FC<NotificationCardProps> = ({ notification }) => {
    const Icon = iconMap[notification.type] || Bell
    const [expanded, setExpanded] = useState(false)
    const dispatch = useDispatch<AppDispatch>()

    const handleClick = () => {
        setExpanded((prev) => !prev)

        // Mark as read if not already read
        if (!notification.read) {
            dispatch(markNotificationAsRead(notification.id))
        }
    }

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation() // Prevent card click
        dispatch(deleteNotification(notification.id))
    }

    const handleMarkAsRead = (e: React.MouseEvent) => {
        e.stopPropagation() // Prevent card click
        if (!notification.read) {
            dispatch(markNotificationAsRead(notification.id))
        }
    }

    return (
        <Card
            onClick={handleClick}
            className={cn(
                "relative border-none max-w-md overflow-x-auto flex-wrap flex items-start w-full p-4 rounded-xl shadow-sm transition-all duration-300 bg-muted/25 backdrop-blur-sm hover:bg-muted/45 cursor-pointer",
                notification.read ? "opacity-70" : "opacity-100",
            )}
        >
            <CardContent className="flex flex-col items-center w-full gap-2 p-0 py-2">
                <div className="flex flex-row items-start justify-between w-full">
                    <div className="flex flex-row w-auto items-center gap-2 justify-center">
                        <div className={cn("p-2 rounded-full flex-shrink-0", notification.read ? "bg-muted/65" : "bg-primary/20")}>
                            <Icon className={cn("h-4 w-4", !notification.read && "text-primary")} />
                        </div>
                        <div className="italics text-sm font-light capitalize">{notification.type.replace("_", " ")}</div>
                    </div>

                    <div className="text-xs text-muted-foreground self-center whitespace-nowrap">
                        {new Date(notification.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </div>
                </div>

                <div className="flex-1 w-full mt-2 gap-2">
                    <p className={cn("text-md text-left font-bold truncate mt-1", !notification.read && "text-primary")}>
                        {notification.title}
                    </p>
                    <p className="text-sm text-left text-muted-foreground truncate mt-1">{notification.message}</p>
                </div>

                {expanded && notification.data && (
                    <div className="mt-2 p-3 bg-muted rounded-md w-full text-sm text-muted-foreground">
                        {notification.type === "ORDER_UPDATE" && notification.data.orderId && (
                            <p>
                                Order ID: <span className="font-medium">{notification.data.orderId}</span>
                            </p>
                        )}
                        {notification.type === "INVENTORY_ALERT" && notification.data.productId && (
                            <p>
                                Product: <span className="font-medium">{notification.data.productId}</span>
                            </p>
                        )}
                        {notification.type === "INTEGRATION_STATUS" && notification.data.integration && (
                            <p>
                                Integration: <span className="font-medium">{notification.data.integration}</span>
                            </p>
                        )}
                    </div>
                )}

                {expanded && (
                    <div className="flex justify-end w-full mt-2 gap-2">
                        {!notification.read && (
                            <Button variant="outline" size="sm" className="h-8 px-2 text-xs" onClick={handleMarkAsRead}>
                                <Check className="h-3.5 w-3.5 mr-1" />
                                Mark as read
                            </Button>
                        )}
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-8 px-2 text-xs text-destructive hover:text-destructive"
                            onClick={handleDelete}
                        >
                            <X className="h-3.5 w-3.5 mr-1" />
                            Delete
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

