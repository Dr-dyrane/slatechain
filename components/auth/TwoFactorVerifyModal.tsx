"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useDispatch, useSelector } from "react-redux"
import { verifyTwoFactorCode, setTwoFactorPending, setTwoFactorToken } from "@/lib/slices/authSlice"
import type { AppDispatch, RootState } from "@/lib/store"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
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
import { Loader2, Shield, RefreshCw } from "lucide-react"

interface TwoFactorVerifyModalProps {
    isOpen: boolean
    onClose: () => void
}

export function TwoFactorVerifyModal({ isOpen, onClose }: TwoFactorVerifyModalProps) {
    const dispatch = useDispatch<AppDispatch>()
    const router = useRouter()
    const { loading, twoFactorToken } = useSelector((state: RootState) => state.auth)

    const [verificationCode, setVerificationCode] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [countdown, setCountdown] = useState(60)
    const [canResend, setCanResend] = useState(false)

    // Create a ref for the input to focus it
    const inputRef = useRef<HTMLInputElement>(null)
    const timerRef = useRef<NodeJS.Timeout | null>(null)

    // Start countdown when modal opens and focus the input
    useEffect(() => {
        if (isOpen) {
            setVerificationCode("")
            setCountdown(60)
            setCanResend(false)

            // Focus the input field
            setTimeout(() => {
                inputRef.current?.focus()
            }, 100)

            timerRef.current = setInterval(() => {
                setCountdown((prev) => {
                    if (prev <= 1) {
                        setCanResend(true)
                        if (timerRef.current) clearInterval(timerRef.current)
                        return 0
                    }
                    return prev - 1
                })
            }, 1000)
        } else {
            if (timerRef.current) clearInterval(timerRef.current)
        }

        return () => {
            if (timerRef.current) clearInterval(timerRef.current)
        }
    }, [isOpen])

    // Handle digit input for verification code
    const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Only allow digits
        const value = e.target.value.replace(/\D/g, "")
        setVerificationCode(value)
    }

    const handleVerify = async () => {
        if (!verificationCode) {
            toast.error("Please enter the verification code")
            return
        }

        if (!twoFactorToken) {
            toast.error("Authentication error. Please try logging in again.")
            handleCancel()
            return
        }

        setIsSubmitting(true)

        try {
            await dispatch(
                verifyTwoFactorCode({
                    token: twoFactorToken,
                    code: verificationCode,
                }),
            ).unwrap()

            toast.success("Successfully verified")
            router.push("/dashboard")
            onClose()
        } catch (error: any) {
            toast.error(error.message || "Invalid verification code")
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleCancel = () => {
        dispatch(setTwoFactorPending(false))
        dispatch(setTwoFactorToken(undefined))
        onClose()
    }

    const handleResendCode = () => {
        // In a real implementation, you would call an API to resend the code
        toast.success("A new verification code has been sent")
        setCountdown(60)
        setCanResend(false)
        setVerificationCode("")

        // Focus the input after resending
        setTimeout(() => {
            inputRef.current?.focus()
        }, 100)

        timerRef.current = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    setCanResend(true)
                    if (timerRef.current) clearInterval(timerRef.current)
                    return 0
                }
                return prev - 1
            })
        }, 1000)
    }

    // Handle Enter key press
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && verificationCode.length > 0) {
            handleVerify()
        }
    }

    return (
        <AlertDialog open={isOpen} onOpenChange={onClose}>
            <AlertDialogContent className="sm:max-w-[425px]">
                <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5" />
                        Two-Factor Verification
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        Enter the verification code sent to your WhatsApp to complete the login.
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Input
                            ref={inputRef}
                            value={verificationCode}
                            onChange={handleCodeChange}
                            onKeyDown={handleKeyDown}
                            placeholder="Enter 6-digit code"
                            maxLength={6}
                            className="text-center text-lg tracking-widest"
                            disabled={isSubmitting || loading}
                        />
                        <p className="text-sm text-muted-foreground text-center">
                            {canResend ? (
                                <Button
                                    variant="link"
                                    size="sm"
                                    className="p-0 h-auto"
                                    onClick={handleResendCode}
                                    disabled={isSubmitting || loading}
                                >
                                    <RefreshCw className="h-3 w-3 mr-1" />
                                    Resend code
                                </Button>
                            ) : (
                                `Resend code in ${countdown} seconds`
                            )}
                        </p>
                    </div>
                </div>

                <AlertDialogFooter>
                    <AlertDialogCancel onClick={handleCancel} disabled={isSubmitting || loading}>
                        Cancel
                    </AlertDialogCancel>
                    <Button onClick={handleVerify} disabled={isSubmitting || loading || verificationCode.length < 4}>
                        {isSubmitting || loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Verifying...
                            </>
                        ) : (
                            "Verify"
                        )}
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}

