"use client"

import { useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { resetPaymentState, updateOrder } from "@/lib/slices/orderSlice"
import type { Order, OrderItem } from "@/lib/types"
import type { AppDispatch, RootState } from "@/lib/store"
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
import { Loader2, X } from "lucide-react"
import { OrderDetailsForm } from "./OrderDetailsForm"
import { OrderItemsForm } from "./OrderItemsForm"
import { EnhancedPaymentModal } from "../payment/PaymentModal"

interface EditOrderModalProps {
  open: boolean
  onClose: () => void
  order: Order | null
}

export function EditOrderModal({ open, onClose, order }: EditOrderModalProps) {
  const dispatch = useDispatch<AppDispatch>()
  const { items: inventoryItems, loading: inventoryLoading } = useSelector((state: RootState) => state.inventory)
  const [activeTab, setActiveTab] = useState("details")
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const { loading: updateLoading, paymentLoading } = useSelector((state: RootState) => state.orders)
  const loading = updateLoading || paymentLoading
  const [updating, setUpdating] = useState(false)

  const [editedOrder, setEditedOrder] = useState<Order | null>(order)

  // Initialize edited order when the order prop changes
  useEffect(() => {
    if (order) {
      setEditedOrder({
        ...order,
        customerId: order.customerId || (order.name as string), // Use customerId if available, otherwise use name
      })
    }
  }, [order])

  const handleStatusChange = (status: Order["status"]) => {
    if (editedOrder) {
      setEditedOrder((prev) => ({ ...prev!, status }))
    }
  }

  const handleCustomerIdChange = (customerId: string) => {
    if (editedOrder) {
      setEditedOrder((prev) => ({ ...prev!, customerId }))
    }
  }

  const handleItemsChange = (items: OrderItem[]) => {
    if (editedOrder) {
      const totalAmount = items.reduce((sum, item) => sum + item.quantity * item.price, 0)
      setEditedOrder((prev) => ({ ...prev!, items, totalAmount }))
    }
  }

  const handlePaidChange = (paid: boolean) => {
    if (editedOrder) {
      setEditedOrder((prev) => ({
        ...prev!,
        paid: paid,
      }))
    }
  }

  const handlePaymentProcess = (paymentResult: boolean) => {
    if (editedOrder) {
      setEditedOrder((prev) => ({
        ...prev!,
        paid: paymentResult,
        status: paymentResult ? "PROCESSING" : prev!.status,
      }))
      setShowPaymentModal(false)

      // Reset payment state in Redux
      dispatch(resetPaymentState())

      if (paymentResult) {
        toast.success("Payment processed successfully")
      }
    }
  }

  const handleSubmit = async () => {
    if (editedOrder) {
      setUpdating(true)
      try {
        // Prepare the payload for the backend
        const orderToSubmit = {
          ...editedOrder,
          items: editedOrder.items?.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          })),
          customerId: editedOrder.customerId || (editedOrder.name as string),
          // Keep the original order number
          orderNumber: editedOrder.orderNumber,
        }

        // Remove name property if it exists to avoid conflicts
        const { name, ...finalOrder } = orderToSubmit

        console.log("Submitting updated order:", finalOrder)
        await dispatch(updateOrder(finalOrder))
        toast.success("Order updated successfully")
        onClose()
      } catch (error) {
        console.error("Error updating order:", error)
        toast.error("Failed to update order")
      } finally {
        setUpdating(false)
      }
    }
  }

  if (!editedOrder) {
    return null
  }

  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent className="w-full max-w-md rounded-2xl sm:max-w-lg mx-auto max-h-[80vh] overflow-y-auto">
        <AlertDialogHeader>
          <div className="flex justify-center items-center relative">
            <AlertDialogTitle>Edit Order: {editedOrder.orderNumber}</AlertDialogTitle>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 absolute -top-4 sm:-top-1 -right-4 p-2 bg-muted rounded-full"
            >
              <X className="w-5 h-5 " />
            </button>
          </div>
          <AlertDialogDescription>Update the order details below. Click save when you're done.</AlertDialogDescription>
        </AlertDialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="details">Order Details</TabsTrigger>
            <TabsTrigger value="items">Order Items</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="mt-4">
            <OrderDetailsForm
              order={editedOrder}
              onStatusChange={handleStatusChange}
              onCustomerIdChange={handleCustomerIdChange}
              onPaymentProcess={() => setShowPaymentModal(true)}
              onPaidChange={handlePaidChange}
            />
          </TabsContent>

          <TabsContent value="items" className="mt-4">
            <OrderItemsForm
              items={editedOrder.items}
              onItemsChange={handleItemsChange}
              inventoryItems={inventoryItems || []}
              inventoryLoading={inventoryLoading}
            />
          </TabsContent>
        </Tabs>

        <Separator className="my-4" />

        <div className="flex justify-between items-center">
          <div className="text-lg font-semibold">Total: ${editedOrder.totalAmount.toFixed(2)}</div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading || updating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {loading || updating ? "Updating Order" : "Update Order"}
            </Button>
          </AlertDialogFooter>
        </div>
      </AlertDialogContent>

      <EnhancedPaymentModal
        open={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onPaymentComplete={handlePaymentProcess}
        amount={editedOrder.totalAmount || 0}
        orderId={editedOrder.id.toLocaleString() || ""}
      />
    </AlertDialog>
  )
}

