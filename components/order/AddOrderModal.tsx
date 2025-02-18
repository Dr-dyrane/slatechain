"use client"

import { useState } from "react"
import { useDispatch } from "react-redux"
import { addOrder } from "@/lib/slices/orderSlice"
import type { Order, OrderItem } from "@/lib/types"
import type { AppDispatch } from "@/lib/store"
import { toast } from "sonner"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Loader2 } from "lucide-react"
import { OrderDetailsForm } from "./OrderDetailsForm"
import { OrderItemsForm } from "./OrderItemsForm"
import { PaymentModal } from "./PaymentModal"

interface AddOrderModalProps {
  open: boolean
  onClose: () => void
}

export function AddOrderModal({ open, onClose }: AddOrderModalProps) {
  const dispatch = useDispatch<AppDispatch>()
  const [activeTab, setActiveTab] = useState("details")
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [loading, setLoading] = useState(false)

  const [newOrder, setNewOrder] = useState<Partial<Order>>({
    customerId: "",
    items: [],
    totalAmount: 0,
    status: "PENDING",
    paid: false,
  })

  const handleStatusChange = (status: Order["status"]) => {
    setNewOrder({ ...newOrder, status })
  }

  const handleCustomerIdChange = (customerId: string) => {
    setNewOrder({ ...newOrder, customerId })
  }

  const handleItemsChange = (items: OrderItem[]) => {
    const totalAmount = items.reduce((sum, item) => sum + item.quantity * item.price, 0)
    setNewOrder({ ...newOrder, items, totalAmount })
  }

  const handlePaymentProcess = (paymentResult: boolean) => {
    setNewOrder({ ...newOrder, paid: paymentResult, status: paymentResult ? "PROCESSING" : "PENDING" })
    setShowPaymentModal(false)
    if (paymentResult) {
      toast.success("Payment processed successfully")
    }
  }

  const handleSubmit = async () => {
    if (!newOrder.customerId || newOrder.customerId.trim() === "") {
      toast.error("Customer ID is required")
      return
    }

    if (!newOrder.items || newOrder.items.length === 0) {
      toast.error("At least one order item is required")
      return
    }

    setLoading(true)
    try {
      const orderToSubmit = {
        ...newOrder,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      await dispatch(addOrder(orderToSubmit as Order))
      toast.success("Order added successfully")
      onClose()
    } catch (error) {
      console.error("Error adding order:", error)
      toast.error("Failed to add order")
    } finally {
      setLoading(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent className="w-full max-w-md rounded-2xl sm:max-w-lg mx-auto max-h-[80vh] overflow-y-auto">
        <AlertDialogHeader>
          <AlertDialogTitle>Add New Order</AlertDialogTitle>
          <AlertDialogDescription>Enter the order details below. Click save when you're done.</AlertDialogDescription>
        </AlertDialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="details">Order Details</TabsTrigger>
            <TabsTrigger value="items">Order Items</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="mt-4">
            <OrderDetailsForm
              order={newOrder as Order}
              onStatusChange={handleStatusChange}
              onCustomerIdChange={handleCustomerIdChange}
              onPaymentProcess={() => setShowPaymentModal(true)}
            />
          </TabsContent>

          <TabsContent value="items" className="mt-4">
            <OrderItemsForm items={newOrder.items || []} onItemsChange={handleItemsChange} />
          </TabsContent>
        </Tabs>

        <Separator className="my-4" />

        <div className="flex justify-between items-center">
          <div className="text-lg font-semibold">Total: ${newOrder.totalAmount?.toFixed(2) || "0.00"}</div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Add Order
            </Button>
          </AlertDialogFooter>
        </div>
      </AlertDialogContent>

      <PaymentModal
        open={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onPaymentComplete={handlePaymentProcess}
        amount={newOrder.totalAmount || 0}
      />
    </AlertDialog>
  )
}

