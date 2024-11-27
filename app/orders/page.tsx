"use client"

import { useEffect } from "react"
import { useSelector, useDispatch } from "react-redux"
import { DataTable } from "@/components/DataTable"
import { Button } from "@/components/ui/button"
import { PlusIcon } from 'lucide-react'
import { RootState } from "@/lib/store"
import { setOrders } from "@/lib/slices/ordersSlice"

// Define the type for each row
interface Order {
    id: number
    orderNumber: string
    customer: string
    status: string
    total: number
}

const columns = [
    {
        accessorKey: "orderNumber",
        header: "Order Number",
    },
    {
        accessorKey: "customer",
        header: "Customer",
    },
    {
        accessorKey: "status",
        header: "Status",
    },
    {
        accessorKey: "total",
        header: "Total",
        cell: ({ row }: { row: { getValue: (columnId: string) => any } }) => {
            const amount = parseFloat(row.getValue("total"))
            const formatted = new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
            }).format(amount)
            return <div className="font-medium">{formatted}</div>
        },
    },
]

export default function OrdersPage() {
    const orders = useSelector((state: RootState) => state.orders.orders)
    const dispatch = useDispatch()

    useEffect(() => {
        // Simulated API call
        const fetchOrders = async () => {
            // In a real application, this would be an API call
            const data = [
                { id: 1, orderNumber: "ORD001", customer: "John Doe", status: "Pending", total: 1500 },
                { id: 2, orderNumber: "ORD002", customer: "Jane Smith", status: "Shipped", total: 2300 },
                { id: 3, orderNumber: "ORD003", customer: "Bob Johnson", status: "Delivered", total: 1800 },
            ]
            dispatch(setOrders(data))
        }

        fetchOrders()
    }, [dispatch])

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Order Management</h1>
                <Button>
                    <PlusIcon className="mr-2 h-4 w-4" /> Create Order
                </Button>
            </div>
            <DataTable columns={columns} data={orders} />
        </div>
    )
}
