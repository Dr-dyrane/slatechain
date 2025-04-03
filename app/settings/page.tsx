"use client"

import { UserPreferences } from "@/components/settings/UserPreferences"
import { Integrations } from "@/components/settings/Integrations"
import { AccountActions } from "@/components/settings/AccountActions"
import { HelpSupportCard } from "@/components/settings/HelpSupportCard"
import { TwoFactorAuthCard } from "@/components/settings/TwoFactorAuthCard"
import { useSelector } from "react-redux"
import { RootState } from "@/lib/store"

export default function SettingsPage() {
  const { user } = useSelector((state: RootState) => state.auth)
  const { role } = user || {}
  const isCustomer = role === "customer"
  return (
    <div className="space-y-6">
      <h1 className="text-2xl sm:text-3xl font-bold mb-8">Settings</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {!isCustomer && (
          <div className="col-span-1 md:col-span-2">
            <Integrations />
          </div>
        )}
        <div className="col-span-1">
          <UserPreferences />
        </div>
        <div className="col-span-1">
          <TwoFactorAuthCard />
        </div>
        <div className="col-span-1">
          <HelpSupportCard />
        </div>
        <div className="col-span-1">
          <AccountActions />
        </div>
      </div>
    </div>
  )
}

