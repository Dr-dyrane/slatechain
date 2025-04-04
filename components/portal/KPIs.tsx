import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Supplier } from "@/lib/types"
import { Package, MessageSquare, TrendingUp } from "lucide-react"

interface KPIsProps {
    supplier: Supplier
}

export function KPIs({ supplier }: KPIsProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
                    <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">12</div>
                    <p className="text-xs text-muted-foreground">+2 from last month</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Unread Messages</CardTitle>
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">3</div>
                    <p className="text-xs text-muted-foreground">From 2 different managers</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Performance Rating</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{supplier.rating}/5</div>
                    <p className="text-xs text-muted-foreground">
                        {supplier.rating >= 4 ? "Excellent" : supplier.rating >= 3 ? "Good" : "Needs improvement"}
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}

