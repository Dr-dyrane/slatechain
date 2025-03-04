"use client"

import type React from "react"
import { useEffect, useMemo, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

import type { ColumnDef } from "@tanstack/react-table"
import { fetchOrders } from "@/lib/slices/orderSlice"
import { fetchInventory } from "@/lib/slices/inventorySlice"
import { fetchNotifications } from "@/lib/slices/notificationSlice"
import type { AppDispatch, RootState } from "@/lib/store"
import { formatCurrency, formatDate } from "@/lib/utils"

import { Skeleton } from "@/components/ui/skeleton"
import {
    ShoppingCart,
    Package,
    Bell,
    ChevronRight,
    Search,
    Filter,
    RefreshCw,
    ShoppingBag,
    CheckCircle,
    AlertCircle,
    CreditCard,
    BarChart3,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { KYCStatus, OnboardingStatus } from "@/lib/types"
import { resumeOnboarding } from "@/lib/slices/onboardingSlice"
import { useRouter } from "next/navigation"
import { fetchMarketTrends, fetchRecommendedProducts, fetchOrderSummary } from "@/lib/slices/customerSlice"
import { PaymentModal } from "@/components/order/PaymentModal"
import AreaChartGradient from "../chart/AreaChartGradient"
import { DataTable } from "../table/DataTable"
import { toast } from "sonner"
import { columns, OrderRow } from "@/app/orders/page"
import UserStatusAlert from "./UserStatusAlert"
import { MonthlySpendingChart } from "../chart/MonthlySpendingChart"


interface CustomerDashboardProps {
    user: any
}

// Order status badge component
const OrderStatusBadge = ({ status }: { status: string }) => {
    const statusMap: Record<string, { color: string; label: string }> = {
        PENDING: { color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200", label: "Pending" },
        PROCESSING: { color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200", label: "Processing" },
        SHIPPED: { color: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200", label: "Shipped" },
        DELIVERED: { color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200", label: "Delivered" },
        CANCELLED: { color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200", label: "Cancelled" },
    }

    const { color, label } = statusMap[status] || { color: "bg-gray-100 text-gray-800", label: status }

    return (
        <Badge className={`${color} font-medium`} variant="outline">
            {label}
        </Badge>
    )
}


// Define columns for products table
const productColumns: ColumnDef<any>[] = [
    {
        accessorKey: "name",
        header: "Product",
        cell: ({ row }) => <div className="font-medium">{row.getValue("name")}</div>,
    },
    {
        accessorKey: "category",
        header: "Category",
    },
    {
        accessorKey: "price",
        header: "Price",
        cell: ({ row }) => formatCurrency(row.getValue("price")),
    },
    {
        accessorKey: "quantity",
        header: "Available",
        cell: ({ row }) => {
            const quantity = row.getValue("quantity") as number
            return (
                <div className="flex items-center">
                    {quantity > 10 ? (
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    ) : quantity > 0 ? (
                        <AlertCircle className="h-4 w-4 text-yellow-500 mr-2" />
                    ) : (
                        <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
                    )}
                    {quantity}
                </div>
            )
        },
    },
    {
        id: "actions",
        cell: ({ row }) => (
            <Button variant="outline" size="sm">
                <ShoppingCart className="h-4 w-4 mr-2" />
                Add to Cart
            </Button>
        ),
    },
]


const CustomerDashboard: React.FC<CustomerDashboardProps> = ({ user }) => {
    const [activeTab, setActiveTab] = useState("overview")
    const [showPaymentModal, setShowPaymentModal] = useState(false)
    const [selectedOrder, setSelectedOrder] = useState<any>(null)
    const dispatch = useDispatch<AppDispatch>()
    const router = useRouter()

    // Get data from Redux store
    const { items: orders, loading: ordersLoading } = useSelector((state: RootState) => state.orders)
    const { items: inventory, loading: inventoryLoading } = useSelector((state: RootState) => state.inventory)
    const { notifications, loading: notificationsLoading } = useSelector((state: RootState) => state.notifications)
    const { areaChartData, loading: chartLoading } = useSelector((state: RootState) => state.kpi)

    const formattedOrders: OrderRow[] = useMemo(() => {
        return orders.map((order) => ({
            id: order.id.toString(),
            orderNumber: order.orderNumber,
            name: order.customerId,
            status: order.status,
            totalAmount: Number(order.totalAmount),
            paid: order.paid,
            items: order.items,
        }))
    }, [orders])

    // Get customer-specific data from Redux store
    const {
        marketTrends,
        recommendedProducts,
        orderSummary,
        loading: customerLoading,
    } = useSelector((state: RootState) => state.customer)

    useEffect(() => {
        // Fetch general data
        dispatch(fetchOrders())
        dispatch(fetchInventory())
        dispatch(fetchNotifications())

        // Fetch customer-specific data
        dispatch(fetchMarketTrends({
            category: '',
            months: 6
        }))
        dispatch(fetchRecommendedProducts())
        dispatch(fetchOrderSummary())
    }, [dispatch])

    const handleResumeOnboarding = () => {
        dispatch(resumeOnboarding())
        router.push("/onboarding")
    }

    const handleReviewKYC = () => {
        router.push("/kyc")
    }

    const handlePaymentProcess = (success: boolean) => {
        if (success) {
            toast.success("Payment processed successfully")
            dispatch(fetchOrders()) // Refresh orders after payment
        }
        setShowPaymentModal(false)
    }

    // Calculate summary statistics
    const pendingOrders = orderSummary?.ordersByStatus.PENDING || 0
    const processingOrders = orderSummary?.ordersByStatus.PROCESSING || 0
    const activeOrders = orderSummary?.activeOrders || 0
    const deliveredOrders = orderSummary?.ordersByStatus.DELIVERED || 0
    const totalSpent = orderSummary?.totalSpent || 0
    const recentOrders = orders?.slice(0, 5) || []

    // Get recommended products
    const availableProducts = recommendedProducts?.recommendedProducts || inventory?.slice(0, 10) || []
    const frequentlyPurchased = recommendedProducts?.frequentlyPurchased || []
    const newArrivals = recommendedProducts?.newArrivals || []

    // Get notifications
    const recentNotifications = notifications?.slice(0, 5) || []
    const unreadNotifications = notifications?.filter((n) => !n.read).length || 0

    return (
        <div className="space-y-6">
            <h1 className="text-2xl sm:text-3xl font-bold">Customer Dashboard</h1>

            {user && (user.onboardingStatus !== OnboardingStatus.COMPLETED || user.kycStatus !== KYCStatus.APPROVED) && (
                <UserStatusAlert
                    kycStatus={user.kycStatus}
                    onboardingStatus={user.onboardingStatus}
                    onResumeOnboarding={handleResumeOnboarding}
                    onReviewKYC={handleReviewKYC}
                />
            )}

            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
                        <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{activeOrders}</div>
                        <p className="text-xs text-muted-foreground">Orders being processed or shipped</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Delivered Orders</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{deliveredOrders}</div>
                        <p className="text-xs text-muted-foreground">Successfully delivered orders</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
                        <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(totalSpent)}</div>
                        <p className="text-xs text-muted-foreground">Lifetime spending</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Notifications</CardTitle>
                        <Bell className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{unreadNotifications}</div>
                        <p className="text-xs text-muted-foreground">Unread notifications</p>
                    </CardContent>
                </Card>
            </div>

            {/* Market Trends Chart */}
            {customerLoading.marketTrends ? (
                <Card>
                    <CardHeader>
                        <CardTitle>Market Trends</CardTitle>
                        <CardDescription>Product availability forecast</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px] flex items-center justify-center">
                            <Skeleton className="h-[250px] w-full" />
                        </div>
                    </CardContent>
                </Card>
            ) : marketTrends?.areaChartData ? (
                <AreaChartGradient data={marketTrends.areaChartData} />
            ) : null}

            {/* Monthly Spending Chart */}
            {orderSummary?.monthlySpending && orderSummary.monthlySpending.length > 0 && <MonthlySpendingChart data={orderSummary.monthlySpending} loading={customerLoading.orderSummary} />}

            {/* Tabs for different sections */}
            <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="w-full mb-12 gap-2 flex flex-wrap justify-start">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="orders">My Orders</TabsTrigger>
                    <TabsTrigger className="bg-muted" value="products">Products</TabsTrigger>
                    <TabsTrigger className="bg-muted" value="recommendations">Recommendations</TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview">
                    <div className="grid gap-4">
                        {/* Recent Orders */}
                        <Card className="md:col-span-1">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle>Recent Orders</CardTitle>
                                    <Link href="/orders">
                                        <Button variant="ghost" size="sm">
                                            View All
                                        </Button>
                                    </Link>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {ordersLoading ? (
                                    <div className="space-y-2">
                                        {[1, 2, 3].map((i) => (
                                            <Skeleton key={i} className="h-12 w-full" />
                                        ))}
                                    </div>
                                ) : recentOrders.length > 0 ? (
                                    <div className="space-y-4">
                                        {recentOrders.map((order) => (
                                            <div key={order.id} className="flex items-center justify-between border-b pb-2">
                                                <div>
                                                    <div className="font-medium">{order.orderNumber}</div>
                                                    <div className="text-sm text-muted-foreground">{formatDate(order.createdAt, "short")}</div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className="text-right">
                                                        <div>{formatCurrency(order.totalAmount)}</div>
                                                        <OrderStatusBadge status={order.status} />
                                                    </div>
                                                    <div className="flex gap-2">
                                                        {!order.paid && (
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => {
                                                                    setSelectedOrder(order)
                                                                    setShowPaymentModal(true)
                                                                }}
                                                            >
                                                                <CreditCard className="h-4 w-4 mr-1" />
                                                                Pay
                                                            </Button>
                                                        )}
                                                        <Link href={`/orders/${order.id}`}>
                                                            <Button variant="ghost" size="sm">
                                                                <ChevronRight className="h-4 w-4" />
                                                            </Button>
                                                        </Link>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-4 text-muted-foreground">No orders found</div>
                                )}
                            </CardContent>
                            <CardFooter>
                                <Link href="/orders" className="w-full">
                                    <Button className="w-full">
                                        <ShoppingCart className="mr-2 h-4 w-4" />
                                        Place New Order
                                    </Button>
                                </Link>
                            </CardFooter>
                        </Card>
                    </div>
                </TabsContent>

                {/* Orders Tab */}
                <TabsContent value="orders">
                    <Card>
                        <CardHeader>
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                <CardTitle>My Orders</CardTitle>
                                <div className="flex flex-col sm:flex-row gap-2">
                                    {/* <div className="relative">
                                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            type="search"
                                            placeholder="Search orders..."
                                            className="pl-8 w-full sm:w-[200px] lg:w-[300px]"
                                        />
                                    </div>
                                    <Button variant="outline" size="sm">
                                        <Filter className="mr-2 h-4 w-4" />
                                        Filter
                                    </Button> */}
                                    <Button variant="outline" size="sm" onClick={() => dispatch(fetchOrders())}>
                                        <RefreshCw className="mr-2 h-4 w-4" />
                                        Refresh
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {ordersLoading ? (
                                <div className="space-y-2">
                                    {[1, 2, 3, 4, 5].map((i) => (
                                        <Skeleton key={i} className="h-12 w-full" />
                                    ))}
                                </div>
                            ) : (
                                <DataTable columns={columns} data={formattedOrders || []} />
                            )}
                        </CardContent>
                        <CardFooter className="flex justify-between">
                            <div className="text-sm text-muted-foreground">Showing {orders?.length || 0} orders</div>
                            <Link href="/orders">
                                <Button>
                                    <ShoppingCart className="mr-2 h-4 w-4" />
                                    Place New Order
                                </Button>
                            </Link>
                        </CardFooter>
                    </Card>
                </TabsContent>

                {/* Products Tab */}
                <TabsContent value="products">
                    <Card>
                        <CardHeader>
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                <CardTitle>Available Products</CardTitle>
                                {/* <div className="flex flex-col sm:flex-row gap-2">
                                    <div className="relative">
                                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            type="search"
                                            placeholder="Search products..."
                                            className="pl-8 w-full sm:w-[200px] lg:w-[300px]"
                                        />
                                    </div>
                                    <Button variant="outline" size="sm">
                                        <Filter className="mr-2 h-4 w-4" />
                                        Filter
                                    </Button>
                                </div> */}
                            </div>
                        </CardHeader>
                        <CardContent>
                            {inventoryLoading ? (
                                <div className="space-y-2">
                                    {[1, 2, 3, 4, 5].map((i) => (
                                        <Skeleton key={i} className="h-12 w-full" />
                                    ))}
                                </div>
                            ) : (
                                <DataTable columns={productColumns} data={availableProducts || []} />
                            )}
                        </CardContent>
                        <CardFooter>
                            <div className="text-sm text-muted-foreground">
                                Showing {availableProducts.length} of {inventory?.length || 0} products
                            </div>
                        </CardFooter>
                    </Card>
                </TabsContent>

                {/* Recommendations Tab */}
                <TabsContent value="recommendations">
                    <div className="space-y-6">
                        {/* Frequently Purchased */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Frequently Purchased</CardTitle>
                                <CardDescription>Products you buy regularly</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {customerLoading.recommendedProducts ? (
                                    <div className="space-y-2">
                                        {[1, 2, 3].map((i) => (
                                            <Skeleton key={i} className="h-12 w-full" />
                                        ))}
                                    </div>
                                ) : frequentlyPurchased && frequentlyPurchased.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {frequentlyPurchased.map((product) => (
                                            <Card key={product._id} className="overflow-hidden">
                                                <div className="p-4">
                                                    <h3 className="font-medium">{product.name}</h3>
                                                    <p className="text-sm text-muted-foreground">{product.category}</p>
                                                    <div className="mt-2 flex justify-between items-center">
                                                        <span className="font-bold">{formatCurrency(product.price)}</span>
                                                        <Button size="sm">
                                                            <ShoppingCart className="h-4 w-4 mr-2" />
                                                            Add to Cart
                                                        </Button>
                                                    </div>
                                                </div>
                                            </Card>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-4 text-muted-foreground">No frequently purchased products found</div>
                                )}
                            </CardContent>
                        </Card>

                        {/* New Arrivals */}
                        <Card>
                            <CardHeader>
                                <CardTitle>New Arrivals</CardTitle>
                                <CardDescription>Recently added products</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {customerLoading.recommendedProducts ? (
                                    <div className="space-y-2">
                                        {[1, 2, 3].map((i) => (
                                            <Skeleton key={i} className="h-12 w-full" />
                                        ))}
                                    </div>
                                ) : newArrivals && newArrivals.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {newArrivals.map((product) => (
                                            <Card key={product._id} className="overflow-hidden">
                                                <div className="p-4">
                                                    <h3 className="font-medium">{product.name}</h3>
                                                    <p className="text-sm text-muted-foreground">{product.category}</p>
                                                    <div className="mt-2 flex justify-between items-center">
                                                        <span className="font-bold">{formatCurrency(product.price)}</span>
                                                        <Button size="sm">
                                                            <ShoppingCart className="h-4 w-4 mr-2" />
                                                            Add to Cart
                                                        </Button>
                                                    </div>
                                                </div>
                                            </Card>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-4 text-muted-foreground">No new arrivals found</div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Recommended Products */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Recommended For You</CardTitle>
                                <CardDescription>Based on your purchase history</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {customerLoading.recommendedProducts ? (
                                    <div className="space-y-2">
                                        {[1, 2, 3].map((i) => (
                                            <Skeleton key={i} className="h-12 w-full" />
                                        ))}
                                    </div>
                                ) : recommendedProducts?.recommendedProducts && recommendedProducts.recommendedProducts.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {recommendedProducts.recommendedProducts.map((product) => (
                                            <Card key={product._id} className="overflow-hidden">
                                                <div className="p-4">
                                                    <h3 className="font-medium">{product.name}</h3>
                                                    <p className="text-sm text-muted-foreground">{product.category}</p>
                                                    <div className="mt-2 flex justify-between items-center">
                                                        <span className="font-bold">{formatCurrency(product.price)}</span>
                                                        <Button size="sm">
                                                            <ShoppingCart className="h-4 w-4 mr-2" />
                                                            Add to Cart
                                                        </Button>
                                                    </div>
                                                </div>
                                            </Card>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-4 text-muted-foreground">No recommendations found</div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>

            {/* Payment Modal */}
            {selectedOrder && (
                <PaymentModal
                    open={showPaymentModal}
                    onClose={() => setShowPaymentModal(false)}
                    onPaymentComplete={handlePaymentProcess}
                    amount={selectedOrder.totalAmount || 0}
                    orderId={selectedOrder._id}
                />
            )}
        </div>
    )
}

export default CustomerDashboard

