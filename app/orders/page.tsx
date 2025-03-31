"use client"

import { useState, useEffect, useMemo } from "react"
import { useSelector, useDispatch } from "react-redux"
import { DataTable } from "@/components/table/DataTable"
import { Button } from "@/components/ui/button"
import { PlusIcon, Package, ChevronRight } from "lucide-react"
import type { RootState, AppDispatch } from "@/lib/store"
import { fetchOrders } from "@/lib/slices/orderSlice"
import { AddOrderModal } from "@/components/order/AddOrderModal"
import type { InventoryItem, Order, OrderItem } from "@/lib/types"
import { EditOrderModal } from "@/components/order/EditOrderModal"
import { DeleteOrderModal } from "@/components/order/DeleteOrderModal"
import { Label } from "@/components/ui/label"
import type { ColumnDef } from "@tanstack/react-table"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import DashboardCard from "@/components/dashboard/DashboardCard"
import { useRouter, useSearchParams } from "next/navigation"

export interface OrderRow {
  id: string
  orderNumber: string
  name: string
  status: Order["status"]
  totalAmount: number
  paid: boolean
  items: OrderItem[]
}

export const columns = (inventoryItems: InventoryItem[]): ColumnDef<OrderRow>[] => [
  {
    accessorKey: "orderNumber",
    header: "Order Number",
  },
  {
    accessorKey: "name",
    header: "Customer ID",
  },
  {
    accessorKey: "totalAmount",
    header: "Total",
    cell: ({ row }) => {
      const total = row.getValue("totalAmount") as number
      return <div className="font-medium">${total.toFixed(2)}</div>
    },
  },
  {
    accessorKey: "items",
    header: "Items",
    cell: ({ row }) => {
      const items = row.getValue("items") as OrderItem[]
      const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)

      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                className="flex items-center space-x-2 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation()
                  e.preventDefault()
                }}
              >
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
                      {inventoryItems.find((inventoryItem) => inventoryItem.id === item.productId)?.name || item.productId}
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
  const router = useRouter();
  const searchParams = useSearchParams();
  const inventoryItems = useSelector((state: RootState) => state.inventory.items)
  const orders = useSelector((state: RootState) => state.orders.items)
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null)
  const [filterStatus, setFilterStatus] = useState<string | null>(null)

  useEffect(() => {
    dispatch(fetchOrders())
    const openAddModal = searchParams.get("add") === "true"; // Get the query parameter.

    if (openAddModal) {
      setAddModalOpen(true);  // Open the modal if the parameter is true.
      //Remove query params
      const newURL = window.location.pathname;
      router.replace(newURL, { scroll: false });
    }
  }, [dispatch, searchParams, router])

  const handleAddModalOpen = () => setAddModalOpen(true)
  const handleEditModalOpen = (order: Order) => {
    setSelectedOrder(order)
    setEditModalOpen(true)
  }

  const handleDeleteModalOpen = (order: Order) => {
    setOrderToDelete(order)
    setDeleteModalOpen(true)
  }

  const handleAddModalClose = () => {
    setAddModalOpen(false)
    dispatch(fetchOrders())
  }

  const handleEditModalClose = () => {
    setSelectedOrder(null)
    setEditModalOpen(false)
    dispatch(fetchOrders())
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
      totalAmount: Number(order.totalAmount),
      paid: order.paid,
      items: order.items,
    }))
  }, [filteredOrders])

  // Calculate KPIs
  const totalOrders = formattedOrders.length
  const totalRevenue = formattedOrders.reduce((sum, order) => sum + order.totalAmount, 0)
  const pendingOrders = formattedOrders.filter((order) => order.status === "PENDING").length
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl sm:text-3xl font-bold">Order Management</h1>
        <Button onClick={handleAddModalOpen}>
          <PlusIcon className="mr-2 h-4 w-4" /> Create Order
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <DashboardCard
          card={{
            title: "Total Orders",
            value: totalOrders.toString(),
            type: "number",
            icon: "Package",
            description: "Total number of orders",
            sparklineData: [totalOrders],
          }}
        />
        <DashboardCard
          card={{
            title: "Total Revenue",
            value: `$${totalRevenue.toFixed(2)}`,
            type: "revenue",
            icon: "DollarSign",
            description: "Total revenue from all orders",
            sparklineData: [totalRevenue],
          }}
        />
        <DashboardCard
          card={{
            title: "Pending Orders",
            value: pendingOrders.toString(),
            type: "number",
            icon: "Clock",
            description: "Orders awaiting processing",
            sparklineData: [pendingOrders],
          }}
        />
        <DashboardCard
          card={{
            title: "Average Order Value",
            value: `$${averageOrderValue.toFixed(2)}`,
            type: "revenue",
            icon: "TrendingUp",
            description: "Average value per order",
            sparklineData: [averageOrderValue],
          }}
        />
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
        columns={columns(inventoryItems)}
        data={formattedOrders}
        onEdit={handleEditModalOpen}
        onDelete={handleDeleteModalOpen}
      />

      <AddOrderModal open={addModalOpen} onClose={handleAddModalClose} />

      {/* Update the EditOrderModal component */}
      <EditOrderModal open={editModalOpen} onClose={handleEditModalClose} order={selectedOrder} />
      <DeleteOrderModal open={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} order={orderToDelete} />
    </div>
  )
}

