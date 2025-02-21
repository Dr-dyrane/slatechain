"use client"

import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import type { AppDispatch, RootState } from "@/lib/store"
import { fetchShopifyOrders, fetchShopifyShop } from "@/lib/slices/shopifySlice"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Building2 } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import DashboardCard from "@/components/dashboard/DashboardCard"
import { ShopifyOrdersTable } from "./ShopifyOrdersTable"
import { ShopifyCustomersTable } from "./ShopifyCustomersTable"
import { ErrorState } from "../ui/error"
import DashboardSkeleton from "@/app/dashboard/loading"
import { useRouter } from "next/navigation"
import { CardData } from "@/lib/slices/kpi/kpiSlice"

export default function ShopifyDashboard() {
    const dispatch = useDispatch<AppDispatch>()
    const router = useRouter()
    const { orders, shop, loading, error, totalRevenue } = useSelector((state: RootState) => state.shopify)

    useEffect(() => {
        dispatch(fetchShopifyOrders())
        dispatch(fetchShopifyShop())
    }, [dispatch])

    const uniqueCustomers = orders ? [...new Set(orders.map((order) => order.customer.email))].length : 0

    const kpiCards = [
        {
            title: "Total Revenue",
            icon: "DollarSign",
            value: `$${totalRevenue.toLocaleString()}`,
            description: "Total revenue from Shopify orders",
            type: "revenue",
            sparklineData: orders?.map((order) => Number(order.total_price)) || [],
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
            sparklineData: orders?.map((order) => Number(order.total_price)) || [],
        },
        {
            title: "Unique Customers",
            icon: "Users",
            value: uniqueCustomers.toString(),
            description: "Total unique customers",
            type: "number",
        },
    ]

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

            <Tabs defaultValue="orders" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="orders">Orders</TabsTrigger>
                    <TabsTrigger value="customers">Customers</TabsTrigger>
                </TabsList>

                <TabsContent value="orders">
                    <Card>
                        <CardHeader>
                            {/* <CardTitle>Orders</CardTitle> */}
                            <CardDescription>Manage your Shopify orders</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ShopifyOrdersTable orders={orders} />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="customers">
                    <Card>
                        <CardHeader>
                            {/* <CardTitle>Customers</CardTitle> */}
                            <CardDescription>View your Shopify customers</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ShopifyCustomersTable customers={orders.map((order) => order.customer)} />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}

