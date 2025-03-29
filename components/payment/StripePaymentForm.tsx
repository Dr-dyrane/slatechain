"use client"

import type React from "react"

import { useState } from "react"
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { createPaymentIntent } from "@/lib/api/payment"

interface StripePaymentFormProps {
    amount: number
    orderId: string
    onSuccess: (paymentIntentId: string) => void
    onError: (error: string) => void
}

interface PaymentIntentResponse {
    clientSecret: string;
}

export function StripePaymentForm({ amount, orderId, onSuccess, onError }: StripePaymentFormProps) {
    const stripe = useStripe()
    const elements = useElements()
    const [loading, setLoading] = useState(false)
    const [clientSecret, setClientSecret] = useState<string | null>(null)

    // Step 1: Create a payment intent when the component mounts
    const handleCreatePaymentIntent = async () => {
        if (clientSecret) return // Already created

        setLoading(true)
        try {
            const response: PaymentIntentResponse = await createPaymentIntent(amount, orderId) as PaymentIntentResponse;
            setClientSecret(response.clientSecret)
        } catch (error) {
            onError("Failed to initialize payment. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    // Step 2: Process the payment when the user submits the form
    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault()

        if (!stripe || !elements || !clientSecret) {
            onError("Stripe has not been properly initialized.")
            return
        }

        setLoading(true)

        try {
            const cardElement = elements.getElement(CardElement)

            if (!cardElement) {
                throw new Error("Card element not found")
            }

            const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
                payment_method: {
                    card: cardElement,
                    billing_details: {
                        // You can add billing details here if needed
                    },
                },
            })

            if (error) {
                throw new Error(error.message || "Payment failed")
            }

            if (paymentIntent.status === "succeeded") {
                onSuccess(paymentIntent.id)
            } else {
                throw new Error(`Payment status: ${paymentIntent.status}`)
            }
        } catch (error) {
            onError(error instanceof Error ? error.message : "Payment processing failed")
        } finally {
            setLoading(false)
        }
    }

    // Create payment intent when component mounts
    useState(() => {
        handleCreatePaymentIntent()
    })

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <div className="p-3 border rounded-md bg-background">
                    <CardElement
                        options={{
                            style: {
                                base: {
                                    fontSize: "16px",
                                    color: "#424770",
                                    "::placeholder": {
                                        color: "#aab7c4",
                                    },
                                },
                                invalid: {
                                    color: "#9e2146",
                                },
                            },
                        }}
                    />
                </div>
                <p className="text-xs text-muted-foreground">Test card: 4242 4242 4242 4242, any future date, any CVC</p>
            </div>

            <Button type="submit" disabled={!stripe || !elements || loading || !clientSecret} className="w-full">
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Pay ${amount.toFixed(2)}
            </Button>
        </form>
    )
}

