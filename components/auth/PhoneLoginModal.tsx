"use client"

import { useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { loginWithPhoneNumber } from "@/lib/slices/authSlice"
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
import { Label } from "@/components/ui/label"
import { Loader2, Phone, ArrowRight } from "lucide-react"
import { PhoneInput } from "@/components/ui/phone-input"
import type { Country } from "@/lib/data/countries"
import { isValidPhoneNumber } from "@/lib/utils"


interface PhoneLoginModalProps {
    isOpen: boolean
    onClose: () => void
    onVerificationNeeded: () => void
}

export function PhoneLoginModal({ isOpen, onClose, onVerificationNeeded }: PhoneLoginModalProps) {
    const dispatch = useDispatch<AppDispatch>()
    const router = useRouter()
    const { loading } = useSelector((state: RootState) => state.auth)

    const [phoneNumber, setPhoneNumber] = useState("")
    const [selectedCountry, setSelectedCountry] = useState<Country | null>(null)
    const [phoneError, setPhoneError] = useState<string | null>(null)
    const [otp, setOtp] = useState("")
    const [otpSent, setOtpSent] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Reset state when modal opens/closes
    useEffect(() => {
        if (!isOpen) {
            // Don't reset immediately to avoid UI flicker during close animation
            const timer = setTimeout(() => {
                if (!isOpen) {
                    setOtp("")
                    setOtpSent(false)
                    setPhoneError(null)
                }
            }, 300)
            return () => clearTimeout(timer)
        }
    }, [isOpen])

    const validatePhoneNumber = (): boolean => {
        if (!phoneNumber) {
            setPhoneError("Phone number is required")
            return false
        }

        if (selectedCountry && !isValidPhoneNumber(phoneNumber, selectedCountry.code)) {
            setPhoneError("Please enter a valid phone number")
            return false
        }

        setPhoneError(null)
        return true
    }

    const handleSendOtp = async () => {
        if (!validatePhoneNumber()) {
            return
        }

        setIsSubmitting(true)

        try {
            await dispatch(loginWithPhoneNumber({ phoneNumber })).unwrap()
            setOtpSent(true)
            toast.success("Verification code sent to your WhatsApp")
        } catch (error: any) {
            toast.error(error.message || "Failed to send verification code")
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleLogin = async () => {
        if (!otp) {
            toast.error("Please enter the verification code")
            return
        }

        setIsSubmitting(true)

        try {
            const result = await dispatch(
                loginWithPhoneNumber({
                    phoneNumber,
                    otp,
                }),
            ).unwrap()

            // Check if 2FA is required
            if ("token" in result && !("user" in result)) {
                onVerificationNeeded()
                onClose()
            } else {
                // Login successful
                toast.success("Login successful")
                router.push("/dashboard")
                onClose()
            }
        } catch (error: any) {
            toast.error(error.message || "Invalid verification code")
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleReset = () => {
        setOtpSent(false)
        setOtp("")
    }

    const handlePhoneChange = (value: string) => {
        setPhoneNumber(value)
        if (phoneError) {
            // Clear error when user types
            setPhoneError(null)
        }
    }

    const handleCountryChange = (country: Country) => {
        setSelectedCountry(country)
        if (phoneError) {
            // Revalidate when country changes
            validatePhoneNumber()
        }
    }

    return (
        <AlertDialog open={isOpen} onOpenChange={onClose}>
            <AlertDialogContent className="sm:max-w-[425px]">
                <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                        <Phone className="h-5 w-5" />
                        {otpSent ? "Enter Verification Code" : "Login with Phone"}
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        {otpSent
                            ? "Enter the verification code sent to your WhatsApp."
                            : "Enter your phone number to receive a verification code."}
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <div className="space-y-4 py-4">
                    {!otpSent ? (
                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number</Label>
                            <PhoneInput
                                value={phoneNumber}
                                onChange={handlePhoneChange}
                                onCountryChange={handleCountryChange}
                                disabled={isSubmitting || loading}
                                error={phoneError || undefined}
                            />
                            <p className="text-sm text-muted-foreground">
                                We'll send a verification code to this number via WhatsApp.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <Label htmlFor="otp">Verification Code</Label>
                            <Input
                                id="otp"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                placeholder="Enter code"
                                maxLength={6}
                                className="text-center text-lg tracking-widest"
                                disabled={isSubmitting || loading}
                            />
                            <div className="flex justify-between">
                                <Button
                                    variant="link"
                                    size="sm"
                                    className="p-0 h-auto"
                                    onClick={handleReset}
                                    disabled={isSubmitting || loading}
                                >
                                    Change phone number
                                </Button>
                                <Button
                                    variant="link"
                                    size="sm"
                                    className="p-0 h-auto"
                                    onClick={handleSendOtp}
                                    disabled={isSubmitting || loading}
                                >
                                    Resend code
                                </Button>
                            </div>
                        </div>
                    )}
                </div>

                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isSubmitting || loading}>Cancel</AlertDialogCancel>
                    <Button onClick={otpSent ? handleLogin : handleSendOtp} disabled={isSubmitting || loading}>
                        {isSubmitting || loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                {otpSent ? "Verifying..." : "Sending..."}
                            </>
                        ) : (
                            <>
                                {otpSent ? "Login" : "Send Code"}
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </>
                        )}
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}

