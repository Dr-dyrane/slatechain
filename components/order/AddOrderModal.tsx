// src/components/order/AddOrderModal.tsx
"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { addOrder } from "@/lib/slices/orderSlice";
import { AppDispatch, RootState } from "@/lib/store";
import { useDispatch, useSelector } from "react-redux";
import { Order, OrderItem, InventoryItem } from "@/lib/types";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckedState } from "@radix-ui/react-checkbox"; // ✅ Import `CheckedState`

const addOrderSchema = z.object({
  customerId: z.string().min(1, "Customer ID is required"),
  items: z.array(
    z.object({
      productId: z.string(),
      quantity: z.number().min(1, "Quantity must be at least 1"),
      price: z.number().min(0, "Price must be non-negative"),
    })
  ).min(1, "At least one item is required"),
  totalAmount: z.number().min(0, "Total must be positive"),
  status: z.enum(["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"]),
  paid: z.boolean().default(false), // ✅ Now included
});

type AddOrderFormValues = z.infer<typeof addOrderSchema>;

interface AddOrderModalProps {
  open: boolean;
  onClose: () => void;
}

export function AddOrderModal({ open, onClose }: AddOrderModalProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { loading } = useSelector((state: RootState) => state.orders);
  const inventory = useSelector((state: RootState) => state.inventory.items);
  const [selectedItems, setSelectedItems] = useState<{ [key: string]: number }>({});
  const [markAsPaid, setMarkAsPaid] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm<AddOrderFormValues>({
    resolver: zodResolver(addOrderSchema),
    defaultValues: { status: "PENDING", items: [], totalAmount: 0, paid: false },
    mode: "onChange",
  });

  useEffect(() => {
    register("items");
  }, [register]);

  const handleCheckboxChange = (item: InventoryItem) => {
    setSelectedItems(prev => {
      if (prev[item.id]) {
        const updated = { ...prev };
        delete updated[item.id];
        return updated;
      }
      return { ...prev, [item.id]: 1 }; // Default quantity: 1
    });
  };

  const handleQuantityChange = (productId: string, quantity: number) => {
    setSelectedItems(prev => ({ ...prev, [productId]: quantity }));
  };

  const calculateTotalAmount = () => {
    return Object.entries(selectedItems).reduce((total, [productId, quantity]) => {
      const item = inventory.find(item => item.id.toString() === productId);
      return total + (item?.price || 0) * quantity;
    }, 0);
  };

  const onSubmit = async (data: AddOrderFormValues) => {
    try {
      const orderItems = Object.entries(selectedItems).map(([productId, quantity]) => {
        const item = inventory.find(item => item.id.toString() === productId);
        return { productId, quantity, price: item?.price || 0 };
      });

      const totalAmount = calculateTotalAmount();

      await dispatch(addOrder({ ...data, items: orderItems, totalAmount, paid: markAsPaid } as Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt'>)).unwrap();
      toast.success(`Order created successfully. ${markAsPaid ? "Marked as Paid" : "Awaiting Payment"}`);
      reset();
      onClose();
    } catch {
      toast.error("Failed to create order. Please try again.");
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Create New Order</AlertDialogTitle>
          <AlertDialogDescription>Fill in order details below.</AlertDialogDescription>
        </AlertDialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Customer ID Input */}
          <div className="space-y-2">
            <Label htmlFor="customerId">Customer ID</Label>
            <Input id="customerId" placeholder="Enter Customer ID" {...register("customerId")} className="input-focus input-hover" />
            {errors.customerId && <p className="text-sm text-red-500">{errors.customerId.message}</p>}
          </div>

          {/* Select Items */}
          <div className="space-y-2">
            <Label>Select Items</Label>
            <ScrollArea className="h-[200px] w-[100%] border rounded-md p-2 border-input">
              {inventory?.map(item => (
                <div key={item.id} className="flex items-center justify-between space-x-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox id={`item-${item.id}`} checked={!!selectedItems[item.id]} onCheckedChange={() => handleCheckboxChange(item)} />
                    <Label htmlFor={`item-${item.id}`} className="text-sm">{item.name} - ₦{item.price}</Label>
                  </div>
                  {selectedItems[item.id] && (
                    <Input
                      type="number"
                      className="w-20"
                      value={selectedItems[item.id]}
                      onChange={e => handleQuantityChange(item.id.toString(), parseInt(e.target.value) || 1)}
                      min="1"
                    />
                  )}
                </div>
              ))}
            </ScrollArea>
            {errors.items && <p className="text-sm text-red-500">{errors.items.message}</p>}
          </div>

          {/* Total Amount (Read-Only) */}
          <div className="space-y-2">
            <Label>Total Amount</Label>
            <Input type="number" className="input-focus input-hover" value={calculateTotalAmount()} readOnly />
          </div>

          {/* Order Status */}
          <div className="space-y-2">
            <Label>Order Status</Label>
            <select className="input-focus input-hover" {...register("status")}>
              <option value="PENDING">Pending</option>
              <option value="PROCESSING">Processing</option>
              <option value="SHIPPED">Shipped</option>
              <option value="DELIVERED">Delivered</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          {/* Mark as Paid Checkbox */}
          <div className="flex items-center space-x-2">
            <Checkbox
              checked={markAsPaid}
              onCheckedChange={(checked: CheckedState) => setMarkAsPaid(checked === true)} // ✅ Fixes TypeScript error
            />
            <Label>Mark as Paid</Label>
          </div>

          {/* Submit Button */}
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <Button type="submit" disabled={loading || !isValid}>
              {loading ? "Adding..." : "Add Order"}
            </Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
