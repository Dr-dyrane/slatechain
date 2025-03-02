"use client";

import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, CreditCard } from "lucide-react";
import { markOrderAsPaidAsync } from "@/lib/slices/orderSlice";
import { AppDispatch, RootState } from "@/lib/store";

interface PaymentModalProps {
  open: boolean;
  onClose: () => void;
  onPaymentComplete: (success: boolean) => void;
  amount: number;
  orderId: string;
}

export function PaymentModal({ open, onClose, onPaymentComplete, amount, orderId }: PaymentModalProps) {
  const dispatch = useDispatch<AppDispatch>()
  const paymentLoading = useSelector((state: RootState) => state.orders.paymentLoading);
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");

  const handlePayment = async () => {
    if (!cardNumber || !expiryDate || !cvv) {
      alert("Please fill in all payment details");
      return;
    }

    try {
      const resultAction = await dispatch(markOrderAsPaidAsync({ id: orderId, method: "card" }));
      if (markOrderAsPaidAsync.fulfilled.match(resultAction)) {
        onPaymentComplete(true);
      } else {
        alert("Payment failed: " + resultAction.payload);
      }
    } catch (error) {
      alert("An error occurred while processing the payment.");
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Process Payment</AlertDialogTitle>
          <AlertDialogDescription>Enter your payment details to complete the order.</AlertDialogDescription>
        </AlertDialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="card-number">Card Number</Label>
            <Input
              id="card-number"
              placeholder="1234 5678 9012 3456"
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value)}
            />
          </div>
          <div className="flex space-x-4">
            <div className="flex-1">
              <Label htmlFor="expiry-date">Expiry Date</Label>
              <Input
                id="expiry-date"
                placeholder="MM/YY"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
              />
            </div>
            <div className="flex-1">
              <Label htmlFor="cvv">CVV</Label>
              <Input id="cvv" placeholder="123" value={cvv} onChange={(e) => setCvv(e.target.value)} />
            </div>
          </div>
          <div className="text-right font-semibold">Total Amount: ${amount.toFixed(2)}</div>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <Button onClick={handlePayment} disabled={paymentLoading}>
            {paymentLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CreditCard className="mr-2 h-4 w-4" />}
            {paymentLoading ? "Processing..." : "Pay Now"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

