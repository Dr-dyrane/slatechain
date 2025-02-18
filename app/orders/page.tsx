"use client"

import { useState, useEffect, useMemo } from "react"
import { useSelector, useDispatch } from "react-redux"
import { DataTable } from "@/components/table/DataTable"
import { Button } from "@/components/ui/button"
import { PlusIcon, Package, ChevronRight } from "lucide-react"
import type { RootState, AppDispatch } from "@/lib/store"
import { fetchOrders } from "@/lib/slices/orderSlice"
import { AddOrderModal } from "@/components/order/AddOrderModal"
import type { Order, OrderItem } from "@/lib/types"
import { EditOrderModal } from "@/components/order/EditOrderModal"
import { DeleteOrderModal } from "@/components/order/DeleteOrderModal"
import { Label } from "@/components/ui/label"
import type { ColumnDef } from "@tanstack/react-table"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface OrderRow {
  id: string
  orderNumber: string
  name: string // Changed from customerId to name
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
    accessorKey: "name", // Changed from customerId to name
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
      const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)

      return (
        <TooltipProvider>
          <Tooltip >
            <TooltipTrigger asChild>
              <div className="flex items-center space-x-2 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation()
                  e.preventDefault()
                }}>
                <Package className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium">
                  {totalItems} item{totalItems !== 1 ? "s" : ""}
                </span>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </div>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="w-64 p-0">
              <div className="shadow-lg overflow-hidden">
                <div className="px-4 py-3 bg-primary/15 border-b border-border">
                  <h3 className="text-sm font-semibold">Order Items</h3>
                </div>
                <div className="px-4 py-2 max-h-48 overflow-y-auto">
                  {items.map((item, index) => (
                    <div
                      key={index}
                      className="py-2 flex justify-between items-center border-b border-muted last:border-b-0"
                    >
                      <span className="text-sm font-medium">{item.productId}</span>
                      <div className="text-xs text-muted-foreground">
                        <span className="mr-2">Qty: {item.quantity}</span>
                        <span>${item.price.toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
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
      name: order.customerId, // Changed from customerId to name
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

      <div className="flex items-center space-x-4">
        <Label>Status Filter:</Label>
        <select className="input-focus input-hover" onChange={(e) => setFilterStatus(e.target.value || null)}>
          <option value="">All Orders</option>
          <option value="PENDING">Pending</option>
          <option value="PROCESSING">Processing</option>
          <option value="SHIPPED">Shipped</option>
          <option value="DELIVERED">Delivered</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      <DataTable
        columns={columns}
        data={formattedOrders}
        onEdit={handleEditModalOpen}
        onDelete={handleDeleteModalOpen}
      />

      <AddOrderModal open={addModalOpen} onClose={() => setAddModalOpen(false)} />
      <EditOrderModal open={editModalOpen} onClose={() => setEditModalOpen(false)} order={selectedOrder} />
      <DeleteOrderModal open={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} order={orderToDelete} />
    </div>
  )
}

