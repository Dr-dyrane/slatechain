"use client"

import { useSelector, useDispatch } from "react-redux"
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Plug } from "lucide-react"
import { setApiKey, setStoreUrl, setIntegrationEnabled } from "@/lib/slices/shopifySlice"
import { useToast } from "@/hooks/use-toast"
import type { AppDispatch, RootState } from "@/lib/store"
import { Integration } from "./Integration"

export function Integrations() {
  const dispatch = useDispatch<AppDispatch>()
  const { toast } = useToast()
  const { user } = useSelector((state: RootState) => state.auth)

  const integrations = [
    {
      name: "Shopify",
      icon: "/icons/shopify.svg",
      enabled: user?.integrations?.shopify?.enabled || false,
      apiKey: user?.integrations?.shopify?.apiKey || "",
      url: user?.integrations?.shopify?.storeUrl || "",
      onToggle: (enabled: boolean) => dispatch(setIntegrationEnabled(enabled)),
      onSave: (apiKey: string, url: string) => {
        dispatch(setApiKey(apiKey))
        dispatch(setStoreUrl(url))
        toast({
          title: "Settings Saved",
          description: "Shopify settings have been updated.",
        })
      },
    },
    // Add more integrations here as needed
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl flex items-center space-x-2">
          <Plug className="h-6 w-6" />
          <span>Integrations</span>
        </CardTitle>
        <CardDescription>Connect SlateChain with your existing systems.</CardDescription>
      </CardHeader>
      {integrations.map((integration) => (
        <Integration key={integration.name} {...integration} />
      ))}
    </Card>
  )
}

