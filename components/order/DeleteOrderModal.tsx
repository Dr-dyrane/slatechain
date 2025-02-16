// src/components/order/DeleteOrderModal.tsx
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AppDispatch, RootState } from "@/lib/store";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { removeOrder } from "@/lib/slices/orderSlice";
import { toast } from "sonner";

const deleteSchema = z.object({
  id: z.number(),
  confirmation: z.string().min(1, "Order number is required"),
});

type DeleteFormValues = z.infer<typeof deleteSchema>;

interface DeleteOrderModalProps {
  open: boolean;
  onClose: () => void;
  orderId: number | null;
  orderNumber?: string;
}

export function DeleteOrderModal({ open, onClose, orderId, orderNumber }: DeleteOrderModalProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { loading } = useSelector((state: RootState) => state.orders);
  const [orderNum, setOrderNum] = useState<string>("");

  useEffect(() => {
    if (orderNumber) {
      setOrderNum(orderNumber);
    }
  }, [orderNumber]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm<DeleteFormValues>({
    resolver: zodResolver(deleteSchema),
    defaultValues: { id: orderId || 0 },
    mode: "onChange",
  });

  const onSubmit = async (formData: DeleteFormValues) => {
    if (!orderId) return;
    try {
      await dispatch(removeOrder(orderId)).unwrap();
      toast.success(`Order ${orderNum} deleted successfully.`);
      reset();
      onClose();
    } catch {
      toast.error("Failed to delete order. Please try again.");
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Order</AlertDialogTitle>
          <AlertDialogDescription>
            You are about to delete order <b>{orderNum}</b>. Please enter the order number below to confirm.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-4">
          <div className="space-y-2">
            <Label htmlFor="confirmation">Confirm Order Number</Label>
            <Input
              id="confirmation"
              placeholder="Enter Order Number"
              {...register("confirmation", {
                validate: (value) => value === orderNum || "Order number does not match.",
              })}
              className="input-focus input-hover"
            />
            {errors.confirmation && <p className="text-sm text-red-500">{errors.confirmation.message}</p>}
          </div>
          <div className="hidden">
            <Input type="hidden" {...register("id")} />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction disabled={loading || !isValid} type="submit" className="bg-red-600">
              {loading ? "Deleting..." : "Confirm Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
