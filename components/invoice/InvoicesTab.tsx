"use client"

import type React from "react"

import { useState, useEffect, useMemo, useCallback } from "react"
import { useSelector, useDispatch } from "react-redux"
import { DataTable } from "@/components/table/DataTable"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import type { RootState, AppDispatch } from "@/lib/store"
import { fetchOrders } from "@/lib/slices/orderSlice"
import { fetchInventory } from "@/lib/slices/inventorySlice"
import { fetchSupplier } from "@/lib/slices/supplierSlice"
import type { ColumnDef } from "@tanstack/react-table"
import { formatCurrency, formatDate } from "@/lib/utils"
import { InvoiceModal } from "@/components/invoice/InvoiceModal"
import type { User } from "@/lib/types"
import { fetchUser } from "@/lib/slices/authSlice"
import DashboardCard from "@/components/dashboard/DashboardCard"
import { Eye, FileText } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"

// Interface for our invoice data
export interface InvoiceData {
    id: string
    invoiceNumber: string
    name: string
    date: string
    dueDate: string
    companyName: string
    companyLogo: string
    companyDetails: string
    fromName: string
    fromEmail: string
    fromAddress: string
    toName: string
    toEmail: string
    toAddress: string
    items: {
        id: string
        description: string
        quantity: number
        price: number
        currency: string
        exchangeRate: number
        discountType: "percentage" | "amount"
        discountValue: number
    }[]
    notes: string
    taxRate: number
    currency: string
    footer: string
    discountType: "percentage" | "amount"
    discountValue: number
    applyInvoiceDiscountToDiscountedItems: boolean
    orderId: string
    orderNumber: string
    totalAmount: number
    status: "PENDING" | "PAID" | "OVERDUE"
}

export default function InvoicesTab() {
    const dispatch = useDispatch<AppDispatch>()
    const orders = useSelector((state: RootState) => state.orders.items)
    const inventoryItems = useSelector((state: RootState) => state.inventory.items)
    const supplier = useSelector((state: RootState) => state.supplier.selectedSupplier)
    const supplierLoading = useSelector((state: RootState) => state.supplier.loading)
    const user = useSelector((state: RootState) => state.auth.user) as User
    const [selectedInvoice, setSelectedInvoice] = useState<InvoiceData | null>(null)
    const [invoiceModalOpen, setInvoiceModalOpen] = useState(false)
    const [supplierIds, setSupplierIds] = useState<Set<string>>(new Set())
    const [currentSupplierId, setCurrentSupplierId] = useState<string | null>(null)

    // Fetch initial data
    useEffect(() => {
        dispatch(fetchOrders())
        dispatch(fetchInventory())
        dispatch(fetchUser())
    }, [dispatch])

    // Process inventory items and collect supplier IDs
    useEffect(() => {
        const newSupplierIds = new Set<string>()

        inventoryItems.forEach((item) => {
            if (item.supplierId) {
                newSupplierIds.add(item.supplierId)
            }
        })

        setSupplierIds(newSupplierIds)
    }, [inventoryItems])

    // Generate invoices from orders
    const invoices: InvoiceData[] = useMemo(() => {
        return orders
            .filter((order) => order.paid) // Only generate invoices for paid orders
            .map((order) => {
                // Find inventory items for each order item
                const orderItems = order.items.map((item) => {
                    const inventoryItem = inventoryItems.find((invItem) => invItem.id === item.productId)

                    // If we find an inventory item with a supplier ID, set it as current
                    if (inventoryItem?.supplierId && !currentSupplierId) {
                        setCurrentSupplierId(inventoryItem.supplierId)
                        dispatch(fetchSupplier(inventoryItem.supplierId))
                    }

                    return {
                        id: item.id || `item-${Math.random().toString(36).substr(2, 9)}`,
                        description: inventoryItem?.name || `Product ID: ${item.productId}`,
                        quantity: item.quantity,
                        price: item.price,
                        currency: "USD", // Default currency
                        exchangeRate: 1,
                        discountType: "percentage" as const,
                        discountValue: 0,
                    }
                })

                // Generate invoice due date (30 days after order date)
                const orderDate = new Date(order.createdAt)
                const dueDate = new Date(orderDate)
                dueDate.setDate(dueDate.getDate() + 30)

                // Determine invoice status
                const now = new Date()
                let status: "PENDING" | "PAID" | "OVERDUE" = "PAID"
                if (dueDate < now) {
                    status = "OVERDUE"
                }

                // Use the supplier from Redux state if available
                const supplierName = supplier?.name || "SlateChain Supply"
                const supplierEmail = supplier?.email || "supply@slatechain.com"
                const supplierAddress = supplier?.address || ""

                return {
                    id: `invoice-${order.id}`,
                    invoiceNumber: `INV-${order.orderNumber.replace("ORD", "")}`,
                    name: `INV-${order.orderNumber.replace("ORD", "")}`,
                    date: orderDate.toISOString().split("T")[0],
                    dueDate: dueDate.toISOString().split("T")[0],
                    companyName: "SlateChain Supply",
                    companyLogo: "/logo.png",
                    companyDetails: "123 Business Street\nMetropolis, CA 90210\nTax ID: 123-45-6789",
                    fromName: supplierName,
                    fromEmail: supplierEmail,
                    fromAddress: supplierAddress,
                    toName: `${user?.firstName || ""} ${user?.lastName || ""}`,
                    toEmail: user?.email || "",
                    toAddress: user?.address?.address1
                        ? `${user.address.address1}${user.address.address2 ? "\n" + user.address.address2 : ""}\n${user.address.city}, ${user.address.state || ""} ${user.address.postalCode || ""}\n${user.address.country}`
                        : "",
                    items: orderItems.map(
                        ({ id, description, quantity, price, currency, exchangeRate, discountType, discountValue }) => ({
                            id,
                            description,
                            quantity,
                            price,
                            currency,
                            exchangeRate,
                            discountType,
                            discountValue,
                        }),
                    ),
                    notes: "Payment is due within 30 days. Thank you for your business!",
                    taxRate: 7.5, // Default tax rate
                    currency: "USD", // Default currency
                    footer: "Thank you for your business!",
                    discountType: "percentage",
                    discountValue: 0,
                    applyInvoiceDiscountToDiscountedItems: true,
                    orderId: order.id.toString(),
                    orderNumber: order.orderNumber,
                    totalAmount: order.totalAmount,
                    status,
                }
            })
    }, [orders, inventoryItems, supplier, user, dispatch, currentSupplierId])

    // Define columns for the invoice table
    const columns: ColumnDef<InvoiceData>[] = [
        {
            accessorKey: "name",
            header: "Invoice",
        },
        {
            accessorKey: "orderNumber",
            header: "Order Number",
        },
        {
            accessorKey: "date",
            header: "Date",
            cell: ({ row }) => formatDate(row.getValue("date")),
        },
        {
            accessorKey: "dueDate",
            header: "Due Date",
            cell: ({ row }) => formatDate(row.getValue("dueDate")),
        },
        {
            accessorKey: "totalAmount",
            header: "Amount",
            cell: ({ row }) => formatCurrency(row.getValue("totalAmount"), "USD"),
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => {
                const status = row.getValue("status") as "PENDING" | "PAID" | "OVERDUE"
                const statusVariants = {
                    PENDING: "bg-warning text-warning-foreground",
                    PAID: "bg-success text-success-foreground",
                    OVERDUE: "bg-destructive text-destructive-foreground",
                }
                return <Badge className={statusVariants[status]}>{status}</Badge>
            },
        },
        {
            id: "actions",
            header: "Preview",
            cell: ({ row }) => {
                const invoice = row.original
                return (
                    <div className="flex space-x-2">
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="ghost" size="icon" onClick={(event) => handleViewInvoice(event, invoice)}>
                                        <Eye className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>View Invoice</TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                )
            },
        },
    ]

    const handleViewInvoice = useCallback((event: React.MouseEvent, invoice: InvoiceData) => {
        event.preventDefault()
        event.stopPropagation() // To also stop row click
        setSelectedInvoice(invoice)
        setInvoiceModalOpen(true)
    }, [])

    // Calculate KPIs
    const totalInvoices = invoices.length
    const totalInvoiceAmount = invoices.reduce((sum, invoice) => sum + invoice.totalAmount, 0)
    const paidInvoices = invoices.filter((invoice) => invoice.status === "PAID").length
    const overdueInvoices = invoices.filter((invoice) => invoice.status === "OVERDUE").length

    // Render loading state
    if (supplierLoading && !invoices.length) {
        return (
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold">Invoices</h2>
                </div>

                {/* Skeleton KPI Cards */}
                <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
                    {[1, 2, 3, 4].map((i) => (
                        <Card key={i}>
                            <CardContent className="p-6">
                                <Skeleton className="h-4 w-24 mb-2" />
                                <Skeleton className="h-8 w-16 mb-4" />
                                <Skeleton className="h-3 w-32" />
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Skeleton Table */}
                <Card>
                    <CardContent className="p-6">
                        <div className="space-y-2">
                            <Skeleton className="h-10 w-full" />
                            {[1, 2, 3, 4, 5].map((i) => (
                                <Skeleton key={i} className="h-12 w-full" />
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Invoices</h2>
            </div>

            {/* KPI Cards */}
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
                <DashboardCard
                    card={{
                        title: "Total Invoices",
                        value: totalInvoices.toString(),
                        type: "number",
                        icon: "FileText",
                        description: "Total number of invoices",
                        sparklineData: [totalInvoices],
                    }}
                />
                <DashboardCard
                    card={{
                        title: "Total Amount",
                        value: `$${totalInvoiceAmount.toFixed(2)}`,
                        type: "revenue",
                        icon: "DollarSign",
                        description: "Total invoice amount",
                        sparklineData: [totalInvoiceAmount],
                    }}
                />
                <DashboardCard
                    card={{
                        title: "Paid Invoices",
                        value: paidInvoices.toString(),
                        type: "number",
                        icon: "CheckCircle",
                        description: "Number of paid invoices",
                        sparklineData: [paidInvoices],
                    }}
                />
                <DashboardCard
                    card={{
                        title: "Overdue Invoices",
                        value: overdueInvoices.toString(),
                        type: "number",
                        icon: "AlertCircle",
                        description: "Number of overdue invoices",
                        sparklineData: [overdueInvoices],
                    }}
                />
            </div>

            {/* Invoice Table */}
            {invoices.length > 0 ? (
                <DataTable columns={columns} data={invoices} />
            ) : (
                <Card className="p-6">
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium">No Invoices Found</h3>
                        <p className="text-muted-foreground mt-2">Invoices will appear here once orders are marked as paid.</p>
                    </div>
                </Card>
            )}

            {/* Invoice Modal */}
            {selectedInvoice && (
                <InvoiceModal
                    open={invoiceModalOpen}
                    onClose={() => setInvoiceModalOpen(false)}
                    invoiceData={selectedInvoice}
                />
            )}
        </div>
    )
}

