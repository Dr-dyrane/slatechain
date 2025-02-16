// src/components/order/EditOrderModal.tsx
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
import { AppDispatch, RootState } from "@/lib/store";
import { useDispatch, useSelector } from "react-redux";
import { Order } from "@/lib/types";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { updateOrder, markOrderAsPaid } from "@/lib/slices/orderSlice";
import { Checkbox } from "@/components/ui/checkbox";

const editOrderSchema = z.object({
  id: z.number(),
  customerId: z.string().min(1, "Customer ID is required"),
  status: z.enum(["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"]),
  paid: z.boolean(),
});

type EditOrderFormValues = z.infer<typeof editOrderSchema>;

interface EditOrderModalProps {
  open: boolean;
  onClose: () => void;
  data: Order | null;
}

export function EditOrderModal({ open, onClose, data }: EditOrderModalProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { loading } = useSelector((state: RootState) => state.orders);
  const [isPaid, setIsPaid] = useState<boolean>(data?.paid || false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EditOrderFormValues>({
    resolver: zodResolver(editOrderSchema),
    defaultValues: data ? { ...data, paid: data.paid } : { id: 0, customerId: "", status: "PENDING", paid: false },
  });

  useEffect(() => {
    if (data) {
      reset({ ...data, paid: data.paid });
      setIsPaid(data.paid);
    }
  }, [data, reset]);

  const handleNextStatus = async () => {
    if (!data) return;

    const statusFlow: Order["status"][] = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED"];
    const nextStatusIndex = statusFlow.indexOf(data.status) + 1;
    const nextStatus = statusFlow[nextStatusIndex] || "DELIVERED";

    try {
      const updatedOrder: Order = { ...data, status: nextStatus };
      await dispatch(updateOrder(updatedOrder)).unwrap(); // ✅ Ensure `unwrap()` works
      toast.success(`Order status updated to ${nextStatus}`);
      onClose();
    } catch {
      toast.error("Failed to update status.");
    }
  };

  const handleMockPayment = async () => {
    if (!data) return;

    try {
      await dispatch(markOrderAsPaid(data.id)) // ✅ Ensure `unwrap()` works for async thunk
      setIsPaid(true);
      toast.success("Order marked as paid.");
    } catch {
      toast.error("Payment failed.");
    }
  };

  const onSubmit = async (formData: EditOrderFormValues) => {
    if (!data) return;

    try {
      const updatedOrder: Order = { ...data, ...formData, paid: isPaid };
      await dispatch(updateOrder(updatedOrder)).unwrap(); // ✅ Ensure `unwrap()` works
      toast.success("Order updated successfully!");
      onClose();
      reset();
    } catch {
      toast.error("Failed to update order.");
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Edit Order</AlertDialogTitle>
          <AlertDialogDescription>Modify order details.</AlertDialogDescription>
        </AlertDialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Customer ID Input */}
          <div className="space-y-2">
            <Label htmlFor="customerId">Customer ID</Label>
            <Input id="customerId" {...register("customerId")} className="input-focus input-hover" />
            {errors.customerId && <p className="text-sm text-red-500">{errors.customerId.message}</p>}
          </div>

          {/* Order Status */}
          <div className="space-y-2">
            <Label htmlFor="status">Order Status</Label>
            <select id="status" className="input-focus input-hover" {...register("status")}>
              <option value="PENDING">Pending</option>
              <option value="PROCESSING">Processing</option>
              <option value="SHIPPED">Shipped</option>
              <option value="DELIVERED">Delivered</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          {/* Mark as Paid Checkbox */}
          <div className="flex items-center space-x-2">
            <Checkbox checked={isPaid} onCheckedChange={() => setIsPaid(!isPaid)} />
            <Label>Mark as Paid</Label>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <Button type="submit" disabled={loading}>
              {loading ? "Updating..." : "Update Order"}
            </Button>
            <Button type="button" onClick={handleNextStatus} disabled={loading || data?.status === "DELIVERED"}>
              {loading ? "Processing..." : "Move to Next Status"}
            </Button>
            <Button type="button" onClick={handleMockPayment} disabled={loading || isPaid}>
              {loading ? "Processing..." : isPaid ? "Already Paid" : "Mock Payment"}
            </Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
