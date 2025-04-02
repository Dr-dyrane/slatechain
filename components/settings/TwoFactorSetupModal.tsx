"use client"

import { useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { setupTwoFactorAuth } from "@/lib/slices/authSlice"
import type { AppDispatch, RootState } from "@/lib/store"
import { TwoFactorMethod } from "@/lib/types"
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
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Loader2, Shield } from "lucide-react"
import { PhoneInput } from "@/components/ui/phone-input"
import type { Country } from "@/lib/data/countries"
import { isValidPhoneNumber } from "@/lib/utils"

interface TwoFactorSetupModalProps {
    isOpen: boolean
    onClose: () => void
    defaultPhoneNumber?: string
}

export function TwoFactorSetupModal({ isOpen, onClose, defaultPhoneNumber = "" }: TwoFactorSetupModalProps) {
    const dispatch = useDispatch<AppDispatch>()
    const { loading, user } = useSelector((state: RootState) => state.auth)

    const [phoneNumber, setPhoneNumber] = useState(defaultPhoneNumber)
    const [selectedCountry, setSelectedCountry] = useState<Country | null>(null)
    const [phoneError, setPhoneError] = useState<string | null>(null)
    const [method, setMethod] = useState<TwoFactorMethod>(TwoFactorMethod.WHATSAPP)
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Reset form when modal opens
    useEffect(() => {
        if (isOpen) {
            setPhoneNumber(defaultPhoneNumber)
            setMethod(TwoFactorMethod.WHATSAPP)
            setPhoneError(null)
        }
    }, [isOpen, defaultPhoneNumber])

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

    const handleSubmit = async () => {
        if (!validatePhoneNumber()) {
            return
        }

        setIsSubmitting(true)

        try {
            await dispatch(
                setupTwoFactorAuth({
                    phoneNumber,
                    method,
                    enable: true,
                }),
            ).unwrap()

            toast.success("Two-factor authentication has been enabled")
            onClose()
        } catch (error: any) {
            toast.error(error.message || "Failed to set up two-factor authentication")
        } finally {
            setIsSubmitting(false)
        }
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
                        <Shield className="h-5 w-5" />
                        Set Up Two-Factor Authentication
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        Add an extra layer of security to your account by requiring a verification code when you log in.
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <PhoneInput
                            value={phoneNumber}
                            onChange={handlePhoneChange}
                            onCountryChange={handleCountryChange}
                            disabled={isSubmitting || loading}
                            error={phoneError || undefined}
                        />
                        <p className="text-sm text-muted-foreground">We'll send verification codes to this number via WhatsApp.</p>
                    </div>

                    <div className="space-y-2">
                        <Label>Verification Method</Label>
                        <RadioGroup
                            value={method}
                            onValueChange={(value) => setMethod(value as TwoFactorMethod)}
                            className="flex flex-col space-y-1"
                        >
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value={TwoFactorMethod.WHATSAPP} id="whatsapp" />
                                <Label htmlFor="whatsapp" className="cursor-pointer">
                                    WhatsApp
                                </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value={TwoFactorMethod.SMS} id="sms" disabled />
                                <Label htmlFor="sms" className="cursor-pointer text-muted-foreground">
                                    SMS (Coming Soon)
                                </Label>
                            </div>
                        </RadioGroup>
                    </div>
                </div>

                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isSubmitting || loading}>Cancel</AlertDialogCancel>
                    <Button onClick={handleSubmit} disabled={isSubmitting || loading}>
                        {isSubmitting || loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Setting Up...
                            </>
                        ) : (
                            "Enable 2FA"
                        )}
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}

