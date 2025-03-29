"use client"

import { useState, useEffect } from "react"
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
import { Loader2, CreditCard, Wallet, Banknote, X, CheckCircle } from "lucide-react"
import { markOrderAsPaidAsync } from "@/lib/slices/orderSlice"
import type { AppDispatch, RootState } from "@/lib/store"
import { StripeProvider } from "./StripeProvider"
import { StripePaymentForm } from "./StripePaymentForm"
import { apiClient } from "@/lib/api/apiClient/[...live]"
import { mockWalletData } from "@/lib/blockchain/mockBlockchainData"
import { connectWallet } from "@/lib/blockchain/web3Provider"

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
  const [paymentSuccess, setPaymentSuccess] = useState(false)

  // Blockchain payment state
  const [walletAddress, setWalletAddress] = useState("")
  const [transactionHash, setTransactionHash] = useState("")
  const [blockchainStep, setBlockchainStep] = useState<"connect" | "pay" | "verify">("connect")
  const [companyWalletAddress, setCompanyWalletAddress] = useState(
    process.env.COMPANY_WALLET_ADDRESS || "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
  )

  // Check if we're in demo mode
  useEffect(() => {
    const isLiveMode = apiClient.getLiveMode()

    // If we're in demo mode and blockchain is selected, auto-connect a mock wallet
    if (!isLiveMode && activeTab === "blockchain" && blockchainStep === "connect") {
      // Auto-connect wallet in demo mode
      setWalletAddress(mockWalletData.wallet.address)
      setBlockchainStep("pay")
    }
  }, [activeTab, blockchainStep])

  // Handle successful Stripe payment
  const handleStripePaymentSuccess = async (paymentIntentId: string) => {
    setError(null)
    try {
      // Use the Redux action to process the payment
      const resultAction = await dispatch(
        markOrderAsPaidAsync({
          id: orderId,
          method: "stripe",
          paymentDetails: {
            clientSecret: paymentIntentId,
          },
        }),
      )

      if (markOrderAsPaidAsync.fulfilled.match(resultAction)) {
        setPaymentSuccess(true)
        onPaymentComplete(true)
      } else {
        setError("Payment verification failed: " + resultAction.payload)
      }
    } catch (error) {
      setError("An error occurred while processing the payment.")
    }
  }

  const handleConnectWallet = async () => {
    setError(null)

    try {
      if (apiClient.getLiveMode()) {
        // In live mode, use the actual wallet connection
        const wallet = await connectWallet()
        if (!wallet) {
          throw new Error("Failed to connect wallet")
        }
        setWalletAddress(wallet.address)
      } else {
        // In demo mode, use mock wallet
        setWalletAddress(mockWalletData.wallet.address)
      }

      setBlockchainStep("pay")
    } catch (error: any) {
      setError(error.message || "Failed to connect wallet")
    }
  }

  const handleBlockchainPayment = async () => {
    if (blockchainStep === "connect") {
      await handleConnectWallet()
      return
    }

    if (blockchainStep === "pay") {
      if (!transactionHash && !apiClient.getLiveMode()) {
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
        // Use the Redux action to process the payment
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
          setPaymentSuccess(true)
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
      // Use the Redux action to process the payment
      const resultAction = await dispatch(
        markOrderAsPaidAsync({
          id: orderId,
          method: "manual",
        }),
      )

      if (markOrderAsPaidAsync.fulfilled.match(resultAction)) {
        setPaymentSuccess(true)
        onPaymentComplete(true)
      } else {
        setError("Payment recording failed: " + resultAction.payload)
      }
    } catch (error) {
      setError("An error occurred while recording the payment.")
    }
  }

  // Reset state when modal closes
  const handleClose = () => {
    if (!paymentLoading) {
      setError(null)
      setPaymentSuccess(false)
      onClose()
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={handleClose}>
      <AlertDialogContent className="w-full max-w-md sm:max-w-lg">
        <AlertDialogHeader>
          <div className="flex justify-center items-center relative">
            <AlertDialogTitle>Process Payment</AlertDialogTitle>
            <button
              onClick={handleClose}
              className="text-gray-500 hover:text-gray-700 absolute -top-4 sm:-top-1 -right-4 p-2 bg-muted rounded-full"
              disabled={paymentLoading}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <AlertDialogDescription>Select a payment method to complete the order.</AlertDialogDescription>
        </AlertDialogHeader>

        {paymentSuccess ? (
          <div className="py-8 text-center">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Payment Successful</h3>
            <p className="text-muted-foreground mb-6">Your payment has been processed successfully.</p>
            <Button onClick={handleClose} className="mx-auto">
              Close
            </Button>
          </div>
        ) : (
          <>
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
                  <StripeProvider>
                    <StripePaymentForm
                      amount={amount}
                      orderId={orderId}
                      onSuccess={handleStripePaymentSuccess}
                      onError={setError}
                    />
                  </StripeProvider>
                </div>
              )}

              {activeTab === "blockchain" && (
                <div className="space-y-4">
                  {blockchainStep === "connect" && (
                    <div className="space-y-4">
                      <p className="text-sm">Connect your wallet to make a payment with cryptocurrency.</p>
                      <Button onClick={handleConnectWallet} disabled={paymentLoading} className="w-full">
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
                          <Input
                            id="companyWallet"
                            value={companyWalletAddress}
                            readOnly
                            className="font-mono text-sm"
                          />
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

                      <Button
                        onClick={handleBlockchainPayment}
                        disabled={paymentLoading || !walletAddress || !transactionHash}
                        className="w-full"
                      >
                        {paymentLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        {paymentLoading ? "Verifying..." : "Verify Transaction"}
                      </Button>
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

                  <Button onClick={handleManualPayment} disabled={paymentLoading} className="w-full">
                    {paymentLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    {paymentLoading ? "Processing..." : "Record Manual Payment"}
                  </Button>
                </div>
              )}

              {error && <div className="p-3 bg-destructive/10 text-destructive rounded-md text-sm">{error}</div>}

              <div className="text-right font-semibold">Total Amount: ${amount.toFixed(2)}</div>
            </div>

            <AlertDialogFooter>
              <AlertDialogCancel disabled={paymentLoading}>Cancel</AlertDialogCancel>
            </AlertDialogFooter>
          </>
        )}
      </AlertDialogContent>
    </AlertDialog>
  )
}

