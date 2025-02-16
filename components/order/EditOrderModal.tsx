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
import { motion } from "framer-motion"; // ✅ Smooth animations

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
      await dispatch(updateOrder(updatedOrder));
      toast.success(`Order status updated to ${nextStatus}`);
      onClose();
    } catch {
      toast.error("Failed to update status.");
    }
  };

  const handleMockPayment = async () => {
    if (!data) return;

    try {
      await dispatch(markOrderAsPaid(data.id));
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
      await dispatch(updateOrder(updatedOrder));
      toast.success("Order updated successfully!");
      onClose();
      reset();
    } catch {
      toast.error("Failed to update order.");
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-lg md:max-w-xl px-6 py-6 rounded-2xl shadow-lg">
        <AlertDialogHeader className="mb-4">
          <AlertDialogTitle className="text-lg font-semibold text-gray-800">Edit Order</AlertDialogTitle>
          <AlertDialogDescription className="text-gray-500">
            Modify order details with real-time updates.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <motion.form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Customer ID Input */}
          <div className="space-y-1">
            <Label htmlFor="customerId" className="text-gray-700">Customer ID</Label>
            <Input id="customerId" {...register("customerId")} className="w-full input-focus" />
            {errors.customerId && <p className="text-sm text-red-500">{errors.customerId.message}</p>}
          </div>

          {/* Order Status */}
          <div className="space-y-1">
            <Label htmlFor="status" className="text-gray-700">Order Status</Label>
            <select id="status" className="w-full input-focus" {...register("status")}>
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
            <Label className="text-gray-700">Mark as Paid</Label>
          </div>

          {/* Buttons - Centered, Responsive, and Modern */}
          <AlertDialogFooter className="flex flex-col md:flex-row md:justify-between gap-3 mt-4">
            {/* Cancel Button (Proper Closing) */}
            <Button variant="ghost" type="button" onClick={onClose} className="w-full md:w-auto">
              Cancel
            </Button>

            <Button variant="outline" type="button" onClick={handleNextStatus} disabled={loading || data?.status === "DELIVERED"} className="w-full md:w-auto">
              {loading ? "Processing..." : "Next Status"}
            </Button>

            <Button variant={isPaid ? "secondary" : "default"} type="button" onClick={handleMockPayment} disabled={loading || isPaid} className="w-full md:w-auto">
              {loading ? "Processing..." : isPaid ? "Already Paid" : "Mock Payment"}
            </Button>

            <Button type="submit" disabled={loading} className="w-full md:w-auto">
              {loading ? "Updating..." : "Save Changes"}
            </Button>
          </AlertDialogFooter>

        </motion.form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
