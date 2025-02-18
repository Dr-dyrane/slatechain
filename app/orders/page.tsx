"use client"

import { useState, useEffect, useMemo } from "react"
import { useSelector, useDispatch } from "react-redux"
import { DataTable } from "@/components/table/DataTable"
import { Button } from "@/components/ui/button"
import { PlusIcon } from "lucide-react"
import type { RootState, AppDispatch } from "@/lib/store"
import { fetchOrders } from "@/lib/slices/orderSlice"
import { AddOrderModal } from "@/components/order/AddOrderModal"
import type { Order, OrderItem } from "@/lib/types"
import { EditOrderModal } from "@/components/order/EditOrderModal"
import { DeleteOrderModal } from "@/components/order/DeleteOrderModal"
import { Label } from "@/components/ui/label"
import type { ColumnDef } from "@tanstack/react-table"

interface OrderRow {
  id: string
  orderNumber: string
  name: string
  status: Order["status"]
  totalAmount: string
  paid: boolean
  items: OrderItem[]
}

const columns: ColumnDef<OrderRow>[] = [
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
    cell: ({ row }) => {
      const status = row.getValue("status") as Order["status"]
      const statusColors: Record<Order["status"], string> = {
        PENDING: "bg-yellow-500/85 text-white",
        PROCESSING: "bg-blue-500/85 text-white",
        SHIPPED: "bg-indigo-500/85 text-white",
        DELIVERED: "bg-green-500/85 text-white",
        CANCELLED: "bg-red-500/85 text-white",
      }
      return <span className={`px-3 py-2 rounded-lg text-xs font-semibold ${statusColors[status]}`}>{status}</span>
    },
  },
  {
    accessorKey: "totalAmount",
    header: "Total",
    cell: ({ row }) => <div className="font-medium">{row.getValue("totalAmount")}</div>,
  },
  {
    accessorKey: "items",
    header: "Items",
    cell: ({ row }) => {
      const items = row.getValue("items") as OrderItem[]
      return (
        <div className="flex flex-col space-y-1">
          {items.map((item, index) => (
            <div key={index} className="text-sm">
              {item.productId} (Qty: {item.quantity}, Price: ${item.price})
            </div>
          ))}
        </div>
      )
    },
  },
  {
    accessorKey: "paid",
    header: "Payment",
    cell: ({ row }) =>
      row.getValue("paid") ? (
        <span className="text-green-500 font-medium">Paid</span>
      ) : (
        <span className="text-red-500 font-medium">Unpaid</span>
      ),
  },
]

export default function OrdersPage() {
  const dispatch = useDispatch<AppDispatch>()
  const orders = useSelector((state: RootState) => state.orders.items)
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null)
  const [filterStatus, setFilterStatus] = useState<string | null>(null)

  useEffect(() => {
    dispatch(fetchOrders())
  }, [dispatch])

  const handleAddModalOpen = () => setAddModalOpen(true)
  const handleEditModalOpen = (order: Order) => {
    setSelectedOrder(order)
    setEditModalOpen(true)
  }

  const handleDeleteModalOpen = (order: Order) => {
    setOrderToDelete(order)
    setDeleteModalOpen(true)
  }

  const filteredOrders = useMemo(() => {
    return filterStatus ? orders.filter((order) => order.status === filterStatus) : orders
  }, [orders, filterStatus])

  const formattedOrders: OrderRow[] = useMemo(() => {
    return filteredOrders.map((order) => ({
      id: order.id.toString(),
      orderNumber: order.orderNumber,
      name: order.customerId,
      status: order.status,
      totalAmount: new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(order.totalAmount),
      paid: order.paid,
      items: order.items,
    }))
  }, [filteredOrders])

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl sm:text-3xl font-bold">Order Management</h1>
        <Button onClick={handleAddModalOpen}>
          <PlusIcon className="mr-2 h-4 w-4" /> Create Order
        </Button>
      </div>

      {/* Status Filter */}
      <div className="flex items-center space-x-4">
        <Label>Status Filter:</Label>
        <select
          className="input-focus input-hover"
          onChange={(e) => setFilterStatus(e.target.value || null)}
        >
          <option value="">All Orders</option>
          <option value="PENDING">Pending</option>
          <option value="PROCESSING">Processing</option>
          <option value="SHIPPED">Shipped</option>
          <option value="DELIVERED">Delivered</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={formattedOrders}
        onEdit={handleEditModalOpen}
        onDelete={handleDeleteModalOpen}
      />

      {/* Modals */}
      <AddOrderModal open={addModalOpen} onClose={() => setAddModalOpen(false)} />
      <EditOrderModal open={editModalOpen} onClose={() => setEditModalOpen(false)} data={selectedOrder} />
      <DeleteOrderModal open={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} order={orderToDelete} />
    </div>
  );
}
