"use client"

import { useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Shield, ShieldCheck, ShieldAlert, Phone } from "lucide-react"
import { setupTwoFactorAuth } from "@/lib/slices/authSlice"
import type { AppDispatch, RootState } from "@/lib/store"
import { TwoFactorMethod } from "@/lib/types"
import { TwoFactorSetupModal } from "./TwoFactorSetupModal"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

export function TwoFactorAuthCard() {
  const dispatch = useDispatch<AppDispatch>()
  const { user, loading } = useSelector((state: RootState) => state.auth)
  const [showSetupModal, setShowSetupModal] = useState(false)

  const is2FAEnabled = user?.twoFactorAuth?.enabled || false
  const phoneNumber = user?.twoFactorAuth?.phoneNumber || user?.phoneNumber || ""

  const handleToggle2FA = async () => {
    if (is2FAEnabled) {
      // If 2FA is enabled, disable it
      try {
        await dispatch(
          setupTwoFactorAuth({
            phoneNumber: phoneNumber,
            method: TwoFactorMethod.WHATSAPP,
            enable: false,
          }),
        ).unwrap()

        toast.success("Two-factor authentication has been disabled")
      } catch (error: any) {
        toast.error(error.message || "Failed to disable two-factor authentication")
      }
    } else {
      // If 2FA is not enabled, show setup modal
      setShowSetupModal(true)
    }
  }

  return (
    <Card className="col-span-1 h-full">
      <CardHeader>
        <CardTitle className="text-xl flex items-center space-x-2">
          {is2FAEnabled ? <ShieldCheck className="h-6 w-6 text-green-500" /> : <Shield className="h-6 w-6" />}
          <span>Two-Factor Authentication</span>
          {is2FAEnabled && (
            <Badge variant="outline" className="ml-2 bg-green-50 text-green-700 border-green-200">
              Enabled
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          Add an extra layer of security to your account with two-factor authentication.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span>WhatsApp Authentication</span>
          </div>
          <Switch checked={is2FAEnabled} onCheckedChange={handleToggle2FA} disabled={loading} />
        </div>

        {is2FAEnabled ? (
          <div className="text-sm text-muted-foreground">
            Two-factor authentication is enabled using WhatsApp to {phoneNumber}.
          </div>
        ) : (
          <div className="text-sm text-muted-foreground flex items-start space-x-2">
            <ShieldAlert className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
            <span>
              Your account is not protected with two-factor authentication. Enable 2FA to add an extra layer of
              security.
            </span>
          </div>
        )}

        {is2FAEnabled && (
          <Button variant="outline" size="sm" onClick={() => setShowSetupModal(true)} disabled={loading}>
            Update 2FA Settings
          </Button>
        )}
      </CardContent>

      <TwoFactorSetupModal
        isOpen={showSetupModal}
        onClose={() => setShowSetupModal(false)}
        defaultPhoneNumber={phoneNumber}
      />
    </Card>
  )
}

