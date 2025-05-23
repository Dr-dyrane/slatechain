"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { createPaymentIntent } from "@/lib/api/payment"
import { apiClient } from "@/lib/api/apiClient/[...live]"

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
    const isLive = apiClient.getLiveMode()

    // Step 1: Create a payment intent when the component mounts
    const handleCreatePaymentIntent = async () => {
        if (clientSecret) return // Already created

        setLoading(true)
        try {
            const response: PaymentIntentResponse = await createPaymentIntent(amount, orderId) as PaymentIntentResponse;
            setClientSecret(response.clientSecret)
        } catch (error) {
            console.error("Payment intent creation error:", error)
            onError(error instanceof Error ? error.message : "Failed to initialize payment. Please try again.")
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
            if (isLive) {
                // In live mode, use Stripe.js to confirm the payment
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
                } else if (paymentIntent.status === "requires_action") {
                    // Handle 3D Secure authentication if needed
                    throw new Error("This payment requires additional authentication steps")
                } else {
                    throw new Error(`Payment status: ${paymentIntent.status}`)
                }
            } else {
                // In mock mode, just simulate a successful payment
                // The client secret is the payment intent ID in our mock implementation
                setTimeout(() => {
                    onSuccess(clientSecret.split("_secret_")[0])
                }, 1000) // Add a small delay to simulate processing
            }
        } catch (error) {
            onError(error instanceof Error ? error.message : "Payment processing failed")
        } finally {
            setLoading(false)
        }
    }

    // Create payment intent when component mounts
    useEffect(() => {
        handleCreatePaymentIntent()
    }, [])

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

