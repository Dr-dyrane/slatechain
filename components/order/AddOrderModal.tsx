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

const addOrderSchema = z.object({
  customerId: z.string().min(1, "Customer ID is required"),
  itemIds: z.array(z.string()).min(1, "Please select at least 1 item"),
  totalAmount: z.number({ invalid_type_error: "Total must be a number" }).min(0, "Total must be a positive number"),
  status: z.string().optional()
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
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid },
    watch,
    trigger
  } = useForm<AddOrderFormValues>({
    resolver: zodResolver(addOrderSchema),
    defaultValues: {
      status: "PENDING"
    }
  });

  useEffect(() => {
    trigger("itemIds")
  }, [selectedItems, trigger]);

  const handleCheckboxChange = (item: InventoryItem) => {
    setSelectedItems(prev => {
      if (prev.includes(item.id.toString())) {
        return prev.filter(id => id !== item.id.toString());
      } else {
        return [...prev, item.id.toString()];
      }
    });
  };

  const handleTotalChange = () => {
    trigger('totalAmount');
  };

  const onSubmit = async (data: AddOrderFormValues) => {
    try {
      const orderItems = (selectedItems as string[]).map((productId: string) => {
        const item = inventory.find(item => item.id.toString() === productId);
        return {
          productId: productId,
          quantity: 1,
          price: item?.price || 10,
        }
      })
      const totalAmount: number = orderItems.reduce((total: number, item: OrderItem) => total + item.price * item.quantity, 0);
      await dispatch(addOrder({ ...data, items: JSON.stringify(orderItems), totalAmount } as Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt'>)).unwrap();
      toast.success('New order item created successfully');
      onClose()
      reset()
    } catch (error: any) {
      toast.error('There was an error creating the order, please try again later');
    }
  }
  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Add New Order</AlertDialogTitle>
          <AlertDialogDescription>Please provide details of order to be created.</AlertDialogDescription>
        </AlertDialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
          <div className="space-y-2">
            <Label htmlFor="customerId">Customer ID</Label>
            <Input
              id="customerId"
              placeholder='Customer ID'
              {...register("customerId")}
              className="input-focus input-hover"
            />
            {errors.customerId && (
              <p className="text-sm text-red-500">{errors.customerId.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="items">Items </Label>
            <ScrollArea className="h-[200px] w-[300px] border rounded-md p-2 border-input ">
              {inventory?.map((item) => (
                <div key={item.id} className="flex items-center space-x-2 ">
                  <Checkbox
                    id={`item-${item.id}`}
                    value={item.id.toString()}
                    checked={selectedItems.includes(item.id.toString())}
                    onCheckedChange={() => handleCheckboxChange(item)}
                  />
                  <Label htmlFor={`item-${item.id}`} className='text-sm'>
                    {item.name}
                  </Label>
                </div>
              ))}
            </ScrollArea>
            {errors.itemIds && (
              <p className="text-sm text-red-500">{errors.itemIds.message}</p>
            )}
          </div>
          <div className="space-y-2 hidden">
            <Label htmlFor="totalAmount">Total Amount</Label>
            <Input
              id="totalAmount"
              type='number'
              placeholder='Total Amount'
              {...register("totalAmount", { valueAsNumber: true })}
              className="input-focus input-hover"
            />
            {errors.totalAmount && (
              <p className="text-sm text-red-500">{errors.totalAmount.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <select
              id="status"
              className="input-focus input-hover"
              {...register("status")}
            >
              <option value="PENDING">PENDING</option>
              <option value="PROCESSING">PROCESSING</option>
              <option value="SHIPPED">SHIPPED</option>
              <option value="DELIVERED">DELIVERED</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>
          </div>
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
};