"use client"

import { useState, useEffect } from "react"
import { useDispatch } from "react-redux"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useRouter, useSearchParams } from "next/navigation"
import { AppDispatch } from "@/lib/store"
import { fetchOrders } from "@/lib/slices/orderSlice"
import OrdersTab from "@/components/order/OrdersTab"
import ReturnsTab from "@/components/returns/ReturnsTab"
import InvoicesTab from "@/components/invoice/InvoicesTab"
import { fetchInventory } from "@/lib/slices/inventorySlice"
import { fetchSuppliers } from "@/lib/slices/supplierSlice"

export default function OrdersPage() {
  const dispatch = useDispatch<AppDispatch>()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState("orders")

  useEffect(() => {
    dispatch(fetchOrders())
    dispatch(fetchInventory())
    dispatch(fetchSuppliers())

    // Check if we should open the add modal from query params
    const openAddModal = searchParams.get("add") === "true"
    const tab = searchParams.get("tab")

    if (tab && (tab === "orders" || tab === "returns" || tab === "invoices")) {
      setActiveTab(tab)
    }

    // Remove query params after handling
    if (openAddModal || tab) {
      const newURL = window.location.pathname
      router.replace(newURL, { scroll: false })
    }
  }, [dispatch, searchParams, router])

  const handleTabChange = (value: string) => {
    setActiveTab(value)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl sm:text-3xl font-bold">Order Management</h1>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="returns">Returns</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
        </TabsList>

        <TabsContent value="orders" className="mt-4">
          <OrdersTab />
        </TabsContent>

        <TabsContent value="returns" className="mt-4">
          <ReturnsTab />
        </TabsContent>

        <TabsContent value="invoices" className="mt-4">
          <InvoicesTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}

