"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { Supplier, Notification as NotificationType, User } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Mail, Phone, MapPin, Star, Calendar, Edit, Bell, MessageSquare, Package, FileText } from "lucide-react"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"

interface OverviewProps {
    supplier: Supplier
    notifications?: NotificationType[]
    onUpdateSupplier: (supplier: Supplier) => Promise<void>
    user: User
}

export function Overview({ supplier, user, notifications = [], onUpdateSupplier }: OverviewProps) {
    const [isEditing, setIsEditing] = useState(false)
    const [formData, setFormData] = useState({
        name: supplier.name,
        email: supplier.email,
        phoneNumber: supplier.phoneNumber,
        address: supplier.address,
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        // Create updated supplier object
        const updatedSupplier = {
            ...supplier,
            ...formData,
        }

        await onUpdateSupplier(updatedSupplier)
        setIsEditing(false)
    }

    // Sort notifications by date (newest first)
    const sortedNotifications = [...notifications]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5) // Only show the 5 most recent

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case "ORDER_UPDATE":
                return <Package className="h-4 w-4 text-primary" />
            case "INVENTORY_ALERT":
                return <Bell className="h-4 w-4 text-primary" />
            case "MESSAGE":
                return <MessageSquare className="h-4 w-4 text-primary" />
            case "DOCUMENT":
                return <FileText className="h-4 w-4 text-primary" />
            default:
                return <Bell className="h-4 w-4 text-primary" />
        }
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <div>
                        <CardTitle>Supplier Profile</CardTitle>
                        <CardDescription>Your supplier information</CardDescription>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Edit Profile</span>
                    </Button>
                </CardHeader>
                <CardContent className="flex flex-col items-center space-y-4">
                    <Avatar className="h-24 w-24">
                        <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${supplier.name}`} alt={supplier.name} />
                        <AvatarFallback>{supplier.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="text-center">
                        <h3 className="text-lg font-semibold">{supplier.name}</h3>
                        <Badge variant={supplier.status === "ACTIVE" ? "default" : "secondary"}>{supplier.status}</Badge>
                    </div>
                    <div className="w-full space-y-3 mt-4">
                        <div className="flex items-center">
                            <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span className="text-sm">{supplier.email}</span>
                        </div>
                        <div className="flex items-center">
                            <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span className="text-sm">{supplier.phoneNumber || user.phoneNumber}</span>
                        </div>
                        <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span className="text-sm">{supplier.address}</span>
                        </div>
                        <div className="flex items-center">
                            <Star className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span className="text-sm">Rating: {supplier.rating}/5</span>
                        </div>
                        <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span className="text-sm">
                                Member since:{" "}
                                {user?.createdAt
                                    ? format(new Date(user.createdAt), "MMM yyyy")
                                    : "Unknown"}
                            </span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="">
                <CardHeader>
                    <CardTitle>Recent Notifications</CardTitle>
                    <CardDescription>Your recent updates and alerts</CardDescription>
                </CardHeader>
                <CardContent>
                    <ScrollArea className="h-[400px] pr-4">
                        {sortedNotifications.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                                <Bell className="h-12 w-12 mb-2 text-muted-foreground/50" />
                                <p>No notifications yet</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {sortedNotifications.map((notification) => (
                                    <div key={notification.id} className="flex items-center p-3 border rounded-md">
                                        <div className="bg-primary/10 p-2 rounded-full mr-3">{getNotificationIcon(notification.type)}</div>
                                        <div>
                                            <p className="text-sm font-medium">{notification.title}</p>
                                            <p className="text-xs text-muted-foreground">{notification.message}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {format(new Date(notification.createdAt), "MMM d, h:mm a")}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </ScrollArea>
                </CardContent>
            </Card>

            {/* Edit Profile Dialog */}
            <Dialog open={isEditing} onOpenChange={setIsEditing}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Profile</DialogTitle>
                        <DialogDescription>Update your supplier information below.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit}>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Name</Label>
                                <Input id="name" name="name" value={formData.name} onChange={handleChange} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phoneNumber">Phone Number</Label>
                                <Input id="phoneNumber" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="address">Address</Label>
                                <Textarea id="address" name="address" value={formData.address} onChange={handleChange} rows={3} />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                                Cancel
                            </Button>
                            <Button type="submit">Save Changes</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}

