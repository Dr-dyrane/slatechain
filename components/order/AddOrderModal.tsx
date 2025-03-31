"use client"

import { useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { addOrder, resetPaymentState } from "@/lib/slices/orderSlice"
import { fetchInventory } from "@/lib/slices/inventorySlice"
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

interface AddOrderModalProps {
  open: boolean
  onClose: () => void
}

export function AddOrderModal({ open, onClose }: AddOrderModalProps) {
  const dispatch = useDispatch<AppDispatch>()
  const { items: inventoryItems, loading: inventoryLoading } = useSelector((state: RootState) => state.inventory)
  const user = useSelector((state: RootState) => state.auth?.user)
  const [activeTab, setActiveTab] = useState("details")
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [loading, setLoading] = useState(false)

  // Fetch inventory items when the modal opens
  useEffect(() => {
    if (open && inventoryItems.length === 0) {
      dispatch(fetchInventory())
    }
  }, [open, dispatch, inventoryItems.length])

  // Initialize order with user ID as customer ID
  const [newOrder, setNewOrder] = useState<Partial<Order>>(() => ({
    customerId: user?.id || "",
    items: [],
    totalAmount: 0,
    status: "PENDING",
    paid: false,
  }))

  // Only update customerId on initial mount if user exists
  useEffect(() => {
    if (user?.id && !newOrder.customerId) {
      setNewOrder((prev) => ({
        ...prev,
        customerId: user.id,
      }))
    }
  }, []) // Empty dependency array to run only once on mount

  const handleStatusChange = (status: Order["status"]) => {
    setNewOrder((prev) => ({ ...prev, status }))
  }

  const handleCustomerIdChange = (customerId: string) => {
    setNewOrder((prev) => ({ ...prev, customerId }))
  }

  const handleItemsChange = (items: OrderItem[]) => {
    const totalAmount = items.reduce((sum, item) => sum + item.quantity * item.price, 0)
    setNewOrder((prev) => ({ ...prev, items, totalAmount }))
  }

  const handlePaidChange = (paid: boolean) => {
    setNewOrder((prev) => ({ ...prev, paid }))
  }

  const handlePaymentProcess = (paymentResult: boolean) => {
    setNewOrder((prev) => ({
      ...prev,
      paid: paymentResult,
      status: paymentResult ? "PROCESSING" : prev.status,
    }))
    setShowPaymentModal(false)

    // Reset payment state in Redux
    dispatch(resetPaymentState())

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

    // Validate that all items have valid product IDs
    const invalidItems = newOrder.items.filter((item) => !item.productId || item.productId.trim() === "")
    if (invalidItems.length > 0) {
      toast.error("All items must have a selected product")
      return
    }

    setLoading(true)
    try {
      // Prepare the payload for the backend
      const orderToSubmit = {
        customerId: newOrder.customerId,
        items: newOrder.items?.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
        })),
        totalAmount: newOrder.totalAmount,
        status: newOrder.status,
        paid: newOrder.paid,
        // The createdBy field will be set by the backend from the authenticated user
      }

      console.log("Submitting order:", orderToSubmit)
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
          <div className="flex justify-center items-center relative">
            <AlertDialogTitle>Add New Order</AlertDialogTitle>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 absolute -top-4 sm:-top-1 -right-4 p-2 bg-muted rounded-full"
            >
              <X className="w-5 h-5 " />
            </button>
          </div>
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
              onPaidChange={handlePaidChange}
            />
          </TabsContent>

          <TabsContent value="items" className="mt-4">
            <OrderItemsForm
              items={newOrder.items || []}
              onItemsChange={handleItemsChange}
              inventoryItems={inventoryItems || []}
              inventoryLoading={inventoryLoading}
            />
          </TabsContent>
        </Tabs>

        <Separator className="my-4" />

        <div className="flex justify-between items-center">
          <div className="text-lg font-semibold">Total: ${newOrder.totalAmount?.toFixed(2) || "0.00"}</div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {loading ? "Adding Order" : "Add Order"}
            </Button>
          </AlertDialogFooter>
        </div>
      </AlertDialogContent>

      <EnhancedPaymentModal
        open={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onPaymentComplete={handlePaymentProcess}
        amount={newOrder.totalAmount || 0}
        orderId={newOrder.id?.toLocaleString() || ""}
      />
    </AlertDialog>
  )
}

