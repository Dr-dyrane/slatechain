"use client"

import { useState, useEffect } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useDispatch, useSelector } from "react-redux"
import { updateOrder, markOrderAsPaid } from "@/lib/slices/orderSlice"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Trash2, Plus, CreditCard, Loader2 } from "lucide-react"

const orderItemSchema = z.object({
  id: z.number().optional(),
  productId: z.string().min(1, "Product ID is required"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  price: z.number().min(0, "Price must be non-negative"),
})

const orderSchema = z.object({
  id: z.number(),
  orderNumber: z.string(),
  customerId: z.string().min(1, "Customer ID is required"),
  items: z.array(orderItemSchema).min(1, "At least one item is required"),
  totalAmount: z.number().min(0, "Total amount must be non-negative"),
  status: z.enum(["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"]),
  paid: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

type OrderFormValues = z.infer<typeof orderSchema>

interface EditOrderModalProps {
  open: boolean
  onClose: () => void
  order: Order | null
}

export function EditOrderModal({ open, onClose, order }: EditOrderModalProps) {
  const dispatch = useDispatch<AppDispatch>()
  const [activeTab, setActiveTab] = useState("details")
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const { loading: updateLoading, paymentLoading } = useSelector((state: RootState) => state.orders)
  const loading = updateLoading || paymentLoading // Combine loading states

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isDirty, isValid },
  } = useForm<OrderFormValues>({
    resolver: zodResolver(orderSchema),
    defaultValues: order || {
      id: 0,
      orderNumber: "",
      customerId: "",
      items: [],
      totalAmount: 0,
      status: "PENDING",
      paid: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  })

  const { fields, append, remove, update } = useFieldArray({
    control,
    name: "items",
  })

  useEffect(() => {
    if (order) {
      reset({
        ...order,
        items: order.items || [],
      })
    }
  }, [order, reset])

  const watchItems = watch("items")
  const watchStatus = watch("status")
  const watchPaid = watch("paid")

  const calculateTotal = (items: OrderItem[] | undefined) => {
    return items?.reduce((sum, item) => sum + item.quantity * item.price, 0) || 0
  }

  useEffect(() => {
    if (watchItems && watchItems.length > 0) {
      const total = calculateTotal(watchItems)
      setValue("totalAmount", total)
    }
  }, [watchItems, setValue]) // Removed calculateTotal from dependency array

  const onSubmit = async (data: OrderFormValues) => {
    try {
      const updatedOrder: Order = {
        ...data,
        updatedAt: new Date().toISOString(),
      }
      await dispatch(updateOrder(updatedOrder))
      toast.success("Order updated successfully")
      onClose()
    } catch (error) {
      toast.error("Failed to update order")
    }
  }

  const handlePayment = () => {
    if (order) {
      dispatch(markOrderAsPaid(order.id))
      setValue("paid", true)
      setValue("status", "PROCESSING")
      toast.success("Payment processed successfully")
      setShowPaymentModal(false)
    }
  }

  const handleAddItem = () => {
    append({ productId: "", quantity: 1, price: 0 })
  }

  const handleUpdateItem = (index: number, data: Partial<OrderItem>) => {
    update(index, { ...watchItems[index], ...data })
  }

  if (!order) return null

  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <AlertDialogHeader>
          <AlertDialogTitle>Edit Order: {order.orderNumber}</AlertDialogTitle>
          <AlertDialogDescription>Update the order details below. Click save when you're done.</AlertDialogDescription>
        </AlertDialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="details">Order Details</TabsTrigger>
            <TabsTrigger value="items">Order Items</TabsTrigger>
          </TabsList>

          <form onSubmit={handleSubmit(onSubmit)}>
            <TabsContent value="details" className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="orderNumber">Order Number</Label>
                  <Input id="orderNumber" {...register("orderNumber")} readOnly />
                </div>
                <div>
                  <Label htmlFor="customerId">Customer ID</Label>
                  <Input id="customerId" {...register("customerId")} />
                  {errors.customerId && <p className="text-sm text-red-500">{errors.customerId.message}</p>}
                </div>
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                <Select onValueChange={(value) => setValue("status", value as Order["status"])} value={watchStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="PROCESSING">Processing</SelectItem>
                    <SelectItem value="SHIPPED">Shipped</SelectItem>
                    <SelectItem value="DELIVERED">Delivered</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Label htmlFor="paid">Payment Status</Label>
                <Badge variant={watchPaid ? "success" : "destructive"}>{watchPaid ? "Paid" : "Unpaid"}</Badge>
                {!watchPaid && (
                  <Button type="button" onClick={() => setShowPaymentModal(true)} size="sm">
                    <CreditCard className="mr-2 h-4 w-4" />
                    Process Payment
                  </Button>
                )}
              </div>
            </TabsContent>

            <TabsContent value="items" className="mt-4 space-y-4">
              {fields.map((field, index) => (
                <Card key={field.id}>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">Item {index + 1}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor={`items.${index}.productId`}>Product ID</Label>
                        <Input
                          {...register(`items.${index}.productId` as const)}
                          onChange={(e) => handleUpdateItem(index, { productId: e.target.value })}
                        />
                        {errors.items?.[index]?.productId && (
                          <p className="text-sm text-red-500">{errors.items[index]?.productId?.message}</p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor={`items.${index}.quantity`}>Quantity</Label>
                        <Input
                          type="number"
                          {...register(`items.${index}.quantity` as const, { valueAsNumber: true })}
                          onChange={(e) => handleUpdateItem(index, { quantity: Number.parseInt(e.target.value) })}
                        />
                        {errors.items?.[index]?.quantity && (
                          <p className="text-sm text-red-500">{errors.items[index]?.quantity?.message}</p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor={`items.${index}.price`}>Price</Label>
                        <Input
                          type="number"
                          step="0.01"
                          {...register(`items.${index}.price` as const, { valueAsNumber: true })}
                          onChange={(e) => handleUpdateItem(index, { price: Number.parseFloat(e.target.value) })}
                        />
                        {errors.items?.[index]?.price && (
                          <p className="text-sm text-red-500">{errors.items[index]?.price?.message}</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button type="button" onClick={() => remove(index)} variant="destructive" size="sm">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Remove Item
                    </Button>
                  </CardFooter>
                </Card>
              ))}
              <Button type="button" onClick={handleAddItem} className="mt-2">
                <Plus className="mr-2 h-4 w-4" />
                Add Item
              </Button>
            </TabsContent>

            <Separator className="my-4" />

            <div className="flex justify-between items-center">
              <div className="text-lg font-semibold">Total: ${calculateTotal(watchItems).toFixed(2)}</div>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <Button type="submit" disabled={!isDirty || !isValid || updateLoading}>
                  {updateLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Save Changes
                </Button>
              </AlertDialogFooter>
            </div>
          </form>
        </Tabs>
      </AlertDialogContent>

      {/* Payment Modal */}
      <AlertDialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Process Payment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to process the payment for this order?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <Button onClick={handlePayment} disabled={paymentLoading}>
              {paymentLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <CreditCard className="mr-2 h-4 w-4" />
              )}
              Confirm Payment
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AlertDialog>
  )
}

