"use client"

import { useEffect, useMemo } from "react"
import { useDispatch, useSelector } from "react-redux"
import { format } from "date-fns"
import type { AppDispatch, RootState } from "@/lib/store"
import { fetchShopifyOrders, fetchShopifyShop } from "@/lib/slices/shopifySlice"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AreaChartGradient } from "@/components/chart/AreaChartGradient"
import DashboardCard from "@/components/dashboard/DashboardCard"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Building2 } from "lucide-react"
import { CardData } from "@/lib/slices/kpi/kpiSlice"
import { AreaChartData } from "@/lib/types"
import DashboardSkeleton from "@/app/dashboard/loading"
import { ErrorState } from "../ui/error"
import { useRouter } from "next/navigation"

export default function ShopifyDashboard() {
    const dispatch = useDispatch<AppDispatch>()
    const { orders, shop, loading, error, totalRevenue } = useSelector((state: RootState) => state.shopify)

    useEffect(() => {
        dispatch(fetchShopifyOrders())
        dispatch(fetchShopifyShop())
    }, [dispatch])

    const router = useRouter()

    const kpiCards = useMemo(
        () => [
            {
                title: "Total Revenue",
                icon: "DollarSign",
                value: `$${totalRevenue.toLocaleString()}`,
                description: "Total revenue from Shopify orders",
                type: "revenue",
                sparklineData: orders?.map((order) => Number.parseFloat(order.total_price)) || [],
            },
            {
                title: "Orders",
                icon: "ShoppingCart",
                value: orders?.length.toString() || "0",
                description: "Total number of orders",
                type: "orders",
                sparklineData: orders?.map((_, i) => i + 1) || [],
            },
            {
                title: "Average Order Value",
                icon: "TrendingUp",
                value: orders?.length ? `$${(totalRevenue / orders.length).toFixed(2)}` : "$0",
                description: "Average value per order",
                type: "revenue",
                sparklineData: orders?.map((order) => Number.parseFloat(order.total_price)) || [],
            },
            {
                title: "Unique Customers",
                icon: "Users",
                value: new Set(orders?.map((order) => order.customer.email)).size.toString() || "0",
                description: "Total unique customers",
                type: "number",
            },
        ],
        [orders, totalRevenue],
    )

    const revenueChartData = useMemo(() => {
        if (!orders?.length) return null

        const monthlyData = orders.reduce((acc: any, order) => {
            const date = new Date(order.created_at)
            const monthKey = format(date, "yyyy-MM")
            if (!acc[monthKey]) {
                acc[monthKey] = {
                    date: monthKey,
                    revenue: 0,
                    orders: 0,
                }
            }
            acc[monthKey].revenue += Number.parseFloat(order.total_price)
            acc[monthKey].orders += 1
            return acc
        }, {})

        return {
            title: "Revenue Over Time",
            data: Object.values(monthlyData),
            xAxisKey: "date",
            yAxisKey: "revenue",
            upperKey: "upperBound",
            lowerKey: "lowerBound",
        }
    }, [orders])

    if (loading) {
        return <DashboardSkeleton />
    }

    if (error) {
        return <div className="flex h-full items-center justify-center bg-none">
            <ErrorState
                message={error}
                onRetry={() => router.refresh()}
                onCancel={() => router.push("/dashboard")}
            />
        </div>
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Shopify Integration</h2>
                    <p className="text-muted-foreground">
                        Connected to {shop?.name} ({shop?.domain})
                    </p>
                </div>
                <Badge variant="outline" className="flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    Store Active
                </Badge>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {kpiCards.map((card, index) => (
                    <DashboardCard key={index} card={card as CardData} />
                ))}
            </div>

            <Tabs defaultValue="overview" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="orders">Orders</TabsTrigger>
                    <TabsTrigger value="customers">Customers</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                        <Card className="col-span-4">
                            <CardHeader>
                                <CardTitle>Revenue Analytics</CardTitle>
                                <CardDescription>Monthly revenue breakdown</CardDescription>
                            </CardHeader>
                            <CardContent className="pl-2">
                                {revenueChartData && <AreaChartGradient data={revenueChartData as AreaChartData} />}
                            </CardContent>
                        </Card>

                        <Card className="col-span-3">
                            <CardHeader>
                                <CardTitle>Recent Orders</CardTitle>
                                <CardDescription>Latest transactions from your store</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Order</TableHead>
                                            <TableHead>Customer</TableHead>
                                            <TableHead className="text-right">Amount</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {orders?.slice(0, 5).map((order) => (
                                            <TableRow key={order.id}>
                                                <TableCell className="font-medium">#{order.order_number}</TableCell>
                                                <TableCell>
                                                    {order.customer.first_name} {order.customer.last_name}
                                                </TableCell>
                                                <TableCell className="text-right">${order.total_price}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="orders">
                    <Card>
                        <CardHeader>
                            <CardTitle>All Orders</CardTitle>
                            <CardDescription>Complete list of orders from your Shopify store</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Order #</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Customer</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Amount</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {orders?.map((order) => (
                                        <TableRow key={order.id}>
                                            <TableCell className="font-medium">#{order.order_number}</TableCell>
                                            <TableCell>{format(new Date(order.created_at), "MMM d, yyyy")}</TableCell>
                                            <TableCell>
                                                {order.customer.first_name} {order.customer.last_name}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={order.fulfillment_status === "fulfilled" ? "default" : "secondary"}>
                                                    {order.fulfillment_status || "Unfulfilled"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">${order.total_price}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="customers">
                    <Card>
                        <CardHeader>
                            <CardTitle>Customer List</CardTitle>
                            <CardDescription>Overview of your Shopify customers</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Orders</TableHead>
                                        <TableHead className="text-right">Total Spent</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {orders?.map((order) => (
                                        <TableRow key={order.customer.id}>
                                            <TableCell className="font-medium">
                                                {order.customer.first_name} {order.customer.last_name}
                                            </TableCell>
                                            <TableCell>{order.customer.email}</TableCell>
                                            <TableCell>{order.customer.orders_count}</TableCell>
                                            <TableCell className="text-right">${order.customer.total_spent}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}

