// src/app/orders/page.tsx
"use client"

import { useState, useEffect } from "react"
import { useSelector, useDispatch } from "react-redux"
import { DataTable } from "@/components/table/DataTable"
import { Button } from "@/components/ui/button"
import { PlusIcon } from 'lucide-react'
import { RootState, AppDispatch } from "@/lib/store"
import { fetchOrders } from "@/lib/slices/orderSlice";
import { AddOrderModal } from "@/components/order/AddOrderModal";

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
    const dispatch = useDispatch<AppDispatch>();
    const orders = useSelector((state: RootState) => state.orders.items)
    const [addModalOpen, setAddModalOpen] = useState(false);

    useEffect(() => {
        dispatch(fetchOrders());
    }, [dispatch])

    const handleAddModalOpen = () => {
        setAddModalOpen(true);
    }

    const handleAddModalClose = () => {
        setAddModalOpen(false);
    };

    const formattedOrders = orders.map(order => ({
        id: order.id.toString(),
        orderNumber: order.orderNumber,
        name: order.customerId,
        status: order.status,
        totalAmount: order.totalAmount,
    }));

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Order Management</h1>
                <Button onClick={handleAddModalOpen}>
                    <PlusIcon className="mr-2 h-4 w-4" /> Create Order
                </Button>
            </div>
            <DataTable columns={columns} data={formattedOrders as any} />
            <AddOrderModal open={addModalOpen} onClose={handleAddModalClose} />
        </div>
    )
}