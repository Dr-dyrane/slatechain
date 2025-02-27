"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { INTEGRATION_OPTIONS } from "@/lib/constants/onboarding-steps"
import type { IntegrationsProps } from "@/lib/types/onboarding"

export function IntegrationsStep({ role, onComplete, onSkip, data }: IntegrationsProps) {
  const [activeTab, setActiveTab] = useState<string>("ecommerce")
  const [integrations, setIntegrations] = useState<
    Record<string, { enabled: boolean; config: Record<string, string> }>
  >({
    ecommerce: { enabled: false, config: { apiKey: "", storeUrl: "" } },
    erp_crm: { enabled: false, config: { apiKey: "" } },
    iot: { enabled: false, config: { apiKey: "" } },
    bi_tools: { enabled: false, config: { apiKey: "" } },
  })

  // Get available integrations for this role
  const availableIntegrations = INTEGRATION_OPTIONS[role] || []

  const handleToggleIntegration = (type: string, enabled: boolean) => {
    setIntegrations((prev) => ({
      ...prev,
      [type]: { ...prev[type], enabled },
    }))
  }

  const handleConfigChange = (type: string, key: string, value: string) => {
    setIntegrations((prev) => ({
      ...prev,
      [type]: {
        ...prev[type],
        config: { ...prev[type].config, [key]: value },
      },
    }))
  }

  useEffect(() => {
    onComplete(integrations as any)
  }, [integrations, onComplete])

  const handleSkip = async () => {
    if (onSkip) {
      await onSkip("Will set up integrations later")
    }
  }

  if (availableIntegrations.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="bg-yellow-50 p-4 rounded-md">
            <p className="text-yellow-700">There are no integrations available for your role at this time.</p>
          </div>
          <div className="mt-4 flex justify-end">
            <Button onClick={handleSkip}>Continue</Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Available Integrations</CardTitle>
        <CardDescription>Connect your existing services to enhance your experience</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue={availableIntegrations[0]} value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 mb-4">
            {availableIntegrations.includes("ecommerce") && <TabsTrigger value="ecommerce">E-commerce</TabsTrigger>}
            {availableIntegrations.includes("erp_crm") && <TabsTrigger value="erp_crm">ERP/CRM</TabsTrigger>}
            {availableIntegrations.includes("iot") && <TabsTrigger value="iot">IoT</TabsTrigger>}
            {availableIntegrations.includes("bi_tools") && <TabsTrigger value="bi_tools">BI Tools</TabsTrigger>}
          </TabsList>

          {availableIntegrations.includes("ecommerce") && (
            <TabsContent value="ecommerce">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Shopify Integration</CardTitle>
                      <CardDescription>Connect your Shopify store</CardDescription>
                    </div>
                    <Switch
                      checked={integrations.ecommerce.enabled}
                      onCheckedChange={(checked) => handleToggleIntegration("ecommerce", checked)}
                    />
                  </div>
                </CardHeader>
                {integrations.ecommerce.enabled && (
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium">API Key</label>
                        <Input
                          value={integrations.ecommerce.config.apiKey}
                          onChange={(e) => handleConfigChange("ecommerce", "apiKey", e.target.value)}
                          placeholder="Enter your Shopify API key"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Store URL</label>
                        <Input
                          value={integrations.ecommerce.config.storeUrl}
                          onChange={(e) => handleConfigChange("ecommerce", "storeUrl", e.target.value)}
                          placeholder="https://your-store.myshopify.com"
                        />
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            </TabsContent>
          )}

          {/* Similar TabsContent blocks for other integration types */}
        </Tabs>
      </CardContent>
    </Card>
  )
}

