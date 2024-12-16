// src/app/orders/page.tsx
"use client"

import { useSelector } from "react-redux"
import { DataTable } from "@/components/DataTable"
import { Button } from "@/components/ui/button"
import { PlusIcon } from 'lucide-react'
import { RootState } from "@/lib/store"

const columns = [
    {
        accessorKey: "orderNumber",
        header: "Order Number",
    },
    {
        accessorKey: "name",
        header: "Customer ID",
    },
    {
        accessorKey: "status",
        header: "Status",
    },
    {
        accessorKey: "totalAmount",
        header: "Total",
         cell: ({ row }: { row: { getValue: (columnId: string) => any } }) => {
            const amount = parseFloat(row.getValue("totalAmount"))
             const formatted = new Intl.NumberFormat("en-US", {
                 style: "currency",
                currency: "USD",
            }).format(amount)
           return <div className="font-medium">{formatted}</div>
         },
    },
];



export default function OrdersPage() {
    const orders = useSelector((state: RootState) => state.orders.items)


    const formattedOrders = orders.map(order => ({
        id: order.id,
        orderNumber: order.orderNumber,
        name: order.customerId,
        status: order.status,
        totalAmount: order.totalAmount,
    }))
    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Order Management</h1>
                <Button>
                    <PlusIcon className="mr-2 h-4 w-4" /> Create Order
                </Button>
            </div>
             <DataTable columns={columns} data={formattedOrders as any} />
        </div>
    )
}