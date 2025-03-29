"use client";

import { UserPreferences } from "@/components/settings/UserPreferences";
import { Integrations } from "@/components/settings/Integrations";
import { AccountActions } from "@/components/settings/AccountActions";
import { HelpSupportCard } from "@/components/settings/HelpSupportCard";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl sm:text-3xl font-bold mb-8">Settings</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="col-span-1 md:col-span-2">
          <Integrations />
        </div>
        <div className="col-span-1">
          <UserPreferences />
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