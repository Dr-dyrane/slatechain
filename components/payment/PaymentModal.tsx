"use client"

import { useState } from "react"
import { useDispatch, useSelector } from "react-redux"
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Loader2, CreditCard, Wallet, Banknote, X } from "lucide-react"
import { markOrderAsPaidAsync } from "@/lib/slices/orderSlice"
import type { AppDispatch, RootState } from "@/lib/store"
import { isLive } from "@/lib/blockchain/web3Provider"

interface PaymentModalProps {
  open: boolean
  onClose: () => void
  onPaymentComplete: (success: boolean) => void
  amount: number
  orderId: string
}

type PaymentMethod = "stripe" | "blockchain" | "manual"

export function EnhancedPaymentModal({ open, onClose, onPaymentComplete, amount, orderId }: PaymentModalProps) {
  const dispatch = useDispatch<AppDispatch>()
  const paymentLoading = useSelector((state: RootState) => state.orders.paymentLoading)
  const [activeTab, setActiveTab] = useState<PaymentMethod>("stripe")
  const [error, setError] = useState<string | null>(null)

  // Stripe payment state
  const [cardNumber, setCardNumber] = useState("")
  const [cardName, setCardName] = useState("")
  const [expiryMonth, setExpiryMonth] = useState("")
  const [expiryYear, setExpiryYear] = useState("")
  const [cvv, setCvv] = useState("")

  // Blockchain payment state
  const [walletAddress, setWalletAddress] = useState("")
  const [transactionHash, setTransactionHash] = useState("")
  const [blockchainStep, setBlockchainStep] = useState<"connect" | "pay" | "verify">("connect")
  const [companyWalletAddress, setCompanyWalletAddress] = useState("0x71C7656EC7ab88b098defB751B7401B5f6d8976F")

  const handleStripePayment = async () => {
    if (!cardNumber || !cardName || !expiryMonth || !expiryYear || !cvv) {
      setError("Please fill in all card details")
      return
    }

    setError(null)
    try {
      const resultAction = await dispatch(
        markOrderAsPaidAsync({
          id: orderId,
          method: "stripe",
          paymentDetails: {
            cardNumber: cardNumber.replace(/\s/g, ""),
            cardName,
            expiry: `${expiryMonth}/${expiryYear}`,
            cvv,
          },
        }),
      )

      if (markOrderAsPaidAsync.fulfilled.match(resultAction)) {
        onPaymentComplete(true)
      } else {
        setError("Payment failed: " + resultAction.payload)
      }
    } catch (error) {
      setError("An error occurred while processing the payment.")
    }
  }

  const handleBlockchainPayment = async () => {
    if (blockchainStep === "connect") {
      // Simulate wallet connection
      setWalletAddress("0x71C7656EC7ab88b098defB751B7401B5f6d8976F")
      setBlockchainStep("pay")
      return
    }

    if (blockchainStep === "pay") {
      if (!transactionHash && !isLive()) {
        // In demo mode, generate a mock transaction hash
        const mockTxHash =
          "0x" +
          Array(64)
            .fill(0)
            .map(() => Math.floor(Math.random() * 16).toString(16))
            .join("")
        setTransactionHash(mockTxHash)
      }

      if (!transactionHash) {
        setError("Transaction hash is required")
        return
      }

      setError(null)
      try {
        const resultAction = await dispatch(
          markOrderAsPaidAsync({
            id: orderId,
            method: "blockchain",
            paymentDetails: {
              walletAddress,
              transactionHash,
            },
          }),
        )

        if (markOrderAsPaidAsync.fulfilled.match(resultAction)) {
          setBlockchainStep("verify")
          onPaymentComplete(true)
        } else {
          setError("Payment verification failed: " + resultAction.payload)
        }
      } catch (error) {
        setError("An error occurred while verifying the transaction.")
      }
    }
  }

  const handleManualPayment = async () => {
    setError(null)
    try {
      const resultAction = await dispatch(
        markOrderAsPaidAsync({
          id: orderId,
          method: "manual",
        }),
      )

      if (markOrderAsPaidAsync.fulfilled.match(resultAction)) {
        onPaymentComplete(true)
      } else {
        setError("Payment recording failed: " + resultAction.payload)
      }
    } catch (error) {
      setError("An error occurred while recording the payment.")
    }
  }

  const handlePayment = async () => {
    switch (activeTab) {
      case "stripe":
        await handleStripePayment()
        break
      case "blockchain":
        await handleBlockchainPayment()
        break
      case "manual":
        await handleManualPayment()
        break
    }
  }

  // Generate month options
  const months = Array.from({ length: 12 }, (_, i) => {
    const month = i + 1
    return month.toString().padStart(2, "0")
  })

  // Generate year options (current year + 10 years)
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 10 }, (_, i) => {
    return (currentYear + i).toString()
  })

  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent className="w-full max-w-md sm:max-w-lg">
        <AlertDialogHeader>
          <div className="flex justify-center items-center relative">
            <AlertDialogTitle>Process Payment</AlertDialogTitle>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 absolute -top-4 sm:-top-1 -right-4 p-2 bg-muted rounded-full"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <AlertDialogDescription>Select a payment method to complete the order.</AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4">
          <RadioGroup
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as PaymentMethod)}
            className="grid grid-cols-3 gap-2"
          >
            <div
              className={`flex flex-col items-center justify-center p-3 border rounded-md cursor-pointer ${activeTab === "stripe" ? "border-primary bg-primary/5" : "border-muted"}`}
            >
              <RadioGroupItem value="stripe" id="stripe" className="sr-only" />
              <CreditCard className="h-6 w-6 mb-1" />
              <Label htmlFor="stripe" className="text-sm cursor-pointer">
                Credit Card
              </Label>
            </div>

            <div
              className={`flex flex-col items-center justify-center p-3 border rounded-md cursor-pointer ${activeTab === "blockchain" ? "border-primary bg-primary/5" : "border-muted"}`}
            >
              <RadioGroupItem value="blockchain" id="blockchain" className="sr-only" />
              <Wallet className="h-6 w-6 mb-1" />
              <Label htmlFor="blockchain" className="text-sm cursor-pointer">
                Blockchain
              </Label>
            </div>

            <div
              className={`flex flex-col items-center justify-center p-3 border rounded-md cursor-pointer ${activeTab === "manual" ? "border-primary bg-primary/5" : "border-muted"}`}
            >
              <RadioGroupItem value="manual" id="manual" className="sr-only" />
              <Banknote className="h-6 w-6 mb-1" />
              <Label htmlFor="manual" className="text-sm cursor-pointer">
                Manual
              </Label>
            </div>
          </RadioGroup>

          {activeTab === "stripe" && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="card-name">Name on Card</Label>
                <Input
                  id="card-name"
                  placeholder="John Doe"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  disabled={paymentLoading}
                />
              </div>
              <div>
                <Label htmlFor="card-number">Card Number</Label>
                <Input
                  id="card-number"
                  placeholder="1234 5678 9012 3456"
                  value={cardNumber}
                  onChange={(e) => {
                    // Format card number with spaces
                    const value = e.target.value
                      .replace(/\D/g, "")
                      .replace(/(.{4})/g, "$1 ")
                      .trim()
                    setCardNumber(value)
                  }}
                  maxLength={19}
                  disabled={paymentLoading}
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="expiry-month">Month</Label>
                  <select
                    id="expiry-month"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={expiryMonth}
                    onChange={(e) => setExpiryMonth(e.target.value)}
                    disabled={paymentLoading}
                  >
                    <option value="">MM</option>
                    {months.map((month) => (
                      <option key={month} value={month}>
                        {month}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="expiry-year">Year</Label>
                  <select
                    id="expiry-year"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={expiryYear}
                    onChange={(e) => setExpiryYear(e.target.value)}
                    disabled={paymentLoading}
                  >
                    <option value="">YYYY</option>
                    {years.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="cvv">CVV</Label>
                  <Input
                    id="cvv"
                    placeholder="123"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value.replace(/\D/g, ""))}
                    maxLength={4}
                    disabled={paymentLoading}
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === "blockchain" && (
            <div className="space-y-4">
              {blockchainStep === "connect" && (
                <div className="space-y-4">
                  <p className="text-sm">Connect your wallet to make a payment with cryptocurrency.</p>
                  <Button onClick={handleBlockchainPayment} disabled={paymentLoading} className="w-full">
                    {paymentLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Connecting...
                      </>
                    ) : (
                      "Connect Wallet"
                    )}
                  </Button>
                </div>
              )}

              {blockchainStep === "pay" && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="walletAddress">Your Wallet Address</Label>
                    <Input
                      id="walletAddress"
                      value={walletAddress}
                      onChange={(e) => setWalletAddress(e.target.value)}
                      disabled={paymentLoading}
                      placeholder="0x..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="companyWallet">Send Payment To</Label>
                    <div className="flex items-center space-x-2">
                      <Input id="companyWallet" value={companyWalletAddress} readOnly className="font-mono text-sm" />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          navigator.clipboard.writeText(companyWalletAddress)
                        }}
                      >
                        Copy
                      </Button>
                    </div>
                  </div>

                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md text-sm text-yellow-800">
                    Send exactly {amount.toFixed(2)} ETH to the address above.
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="transactionHash">Transaction Hash</Label>
                    <Input
                      id="transactionHash"
                      value={transactionHash}
                      onChange={(e) => setTransactionHash(e.target.value)}
                      disabled={paymentLoading}
                      placeholder="0x..."
                    />
                    <p className="text-xs text-muted-foreground">
                      Enter the transaction hash after sending the payment
                    </p>
                  </div>
                </div>
              )}

              {blockchainStep === "verify" && (
                <div className="space-y-4 text-center">
                  <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium">Payment Verified</h3>
                    <p className="text-sm text-muted-foreground">
                      Your blockchain payment has been verified and recorded.
                    </p>
                  </div>
                  <div className="text-xs text-muted-foreground overflow-hidden text-ellipsis">
                    <p>Transaction: {transactionHash}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "manual" && (
            <div className="space-y-4">
              <p className="text-sm">Record a manual payment for this order. This is typically used for:</p>
              <ul className="list-disc list-inside text-sm space-y-1">
                <li>Bank transfers</li>
                <li>Cash payments</li>
                <li>Checks</li>
                <li>Other offline payment methods</li>
              </ul>
              <p className="text-sm font-medium">
                This will mark the order as paid without processing an actual payment.
              </p>
            </div>
          )}

          {error && <div className="p-3 bg-destructive/10 text-destructive rounded-md text-sm">{error}</div>}

          <div className="text-right font-semibold">Total Amount: ${amount.toFixed(2)}</div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <Button onClick={handlePayment} disabled={paymentLoading}>
            {paymentLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {paymentLoading ? "Processing..." : "Pay Now"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

