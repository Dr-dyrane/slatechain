import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CreditCard } from "lucide-react"
import type { Order } from "@/lib/types"

const orderDetailsSchema = z.object({
  orderNumber: z.string(),
  customerId: z.string().min(1, "Customer ID is required"),
  status: z.enum(["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"]),
  paid: z.boolean(),
})

type OrderDetailsFormValues = z.infer<typeof orderDetailsSchema>

interface OrderDetailsFormProps {
  order: Order
  onStatusChange: (status: Order["status"]) => void
  onCustomerIdChange: (customerId: string) => void
  onPaymentProcess: () => void
}

export function OrderDetailsForm({
  order,
  onStatusChange,
  onCustomerIdChange,
  onPaymentProcess,
}: OrderDetailsFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<OrderDetailsFormValues>({
    resolver: zodResolver(orderDetailsSchema),
    defaultValues: {
      orderNumber: order.orderNumber,
      customerId: order.customerId || order.name, // Use customerId if available, otherwise use name
      status: order.status,
      paid: order.paid,
    },
  })

  const watchStatus = watch("status")
  const watchPaid = watch("paid")

  console.log("OrderDetailsForm rendered with order:", order)

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="orderNumber">Order Number</Label>
          <Input id="orderNumber" {...register("orderNumber")} readOnly />
        </div>
        <div>
          <Label htmlFor="customerId">Customer ID</Label>
          <Input id="customerId" {...register("customerId")} onChange={(e) => onCustomerIdChange(e.target.value)} />
          {errors.customerId && <p className="text-sm text-red-500">{errors.customerId.message}</p>}
        </div>
      </div>

      <div>
        <Label htmlFor="status">Status</Label>
        <Select
          onValueChange={(value) => {
            setValue("status", value as Order["status"])
            onStatusChange(value as Order["status"])
          }}
          value={watchStatus}
        >
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
          <Button type="button" onClick={onPaymentProcess} size="sm">
            <CreditCard className="mr-2 h-4 w-4" />
            Process Payment
          </Button>
        )}
      </div>
    </div>
  )
}

