"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { INTEGRATION_OPTIONS } from "@/lib/constants/onboarding-steps";
import type { IntegrationsProps } from "@/lib/types/onboarding";
import { services } from "@/lib/constants/icons"; // Import services for icons

interface IntegrationConfig {
  apiKey?: string;
  storeUrl?: string;
}

export function IntegrationsStep({ role, onComplete, onSkip, data }: IntegrationsProps) {
  const [activeTab, setActiveTab] = useState<string>("ecommerce");
  const [integrations, setIntegrations] = useState<Record<string, { enabled: boolean; config: IntegrationConfig }>>({
    ecommerce: { enabled: false, config: {} },
    erp_crm: { enabled: false, config: {} },
    iot: { enabled: false, config: {} },
    bi_tools: { enabled: false, config: {} },
    auth: { enabled: false, config: {} }, // Ensure all possible services are included
  });

  const availableIntegrations = INTEGRATION_OPTIONS[role] || [];

  const handleToggleIntegration = (type: keyof typeof integrations, enabled: boolean) => {
    setIntegrations((prev) => ({
      ...prev,
      [type]: { ...prev[type], enabled },
    }));
  };

  const handleConfigChange = (type: keyof typeof integrations, key: keyof IntegrationConfig, value: string) => {
    setIntegrations((prev) => ({
      ...prev,
      [type]: {
        ...prev[type],
        config: { ...prev[type].config, [key]: value },
      },
    }));
  };

  useEffect(() => {
    onComplete(integrations as any);
  }, [integrations, onComplete]);

  const handleSkip = async () => {
    if (onSkip) {
      await onSkip("Will set up integrations later");
    }
  };

  const renderConfigInputs = (type: keyof typeof integrations) => {
    const config = integrations[type].config;
    return (
      <div className="space-y-4">
        {"apiKey" in config && (
          <div>
            <label htmlFor={`${type}-api-key`} className="text-sm font-medium">
              API Key
            </label>
            <Input
              id={`${type}-api-key`}
              value={config.apiKey || ""}
              onChange={(e) => handleConfigChange(type, "apiKey", e.target.value)}
              placeholder="Enter API key"
            />
          </div>
        )}
        {"storeUrl" in config && (
          <div>
            <label htmlFor={`${type}-store-url`} className="text-sm font-medium">
              Store URL
            </label>
            <Input
              id={`${type}-store-url`}
              value={config.storeUrl || ""}
              onChange={(e) => handleConfigChange(type, "storeUrl", e.target.value)}
              placeholder="Enter Store URL"
            />
          </div>
        )}
      </div>
    );
  };

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
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Available Integrations</CardTitle>
        <CardDescription>Connect your existing services to enhance your experience.</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue={availableIntegrations[0]} value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 mb-4">
            {availableIntegrations.map((type) => (
              <TabsTrigger key={type} value={type}>
                {services[type as keyof typeof services]?.[0]?.name || type}
              </TabsTrigger>
            ))}
          </TabsList>

          {availableIntegrations.map((type) => (
            <TabsContent key={type} value={type}>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {services[type as keyof typeof services]?.[0]?.logo && (
                        <img src={services[type as keyof typeof services][0].logo} alt={services[type as keyof typeof services][0].name} className="w-6 h-6" />
                      )}
                      <div>
                        <CardTitle>{services[type as keyof typeof services]?.[0]?.name || type} Integration</CardTitle>
                        <CardDescription>Connect your {services[type as keyof typeof services]?.[0]?.name || type} system</CardDescription>
                      </div>
                    </div>
                    <Switch
                      checked={integrations[type as keyof typeof integrations].enabled}
                      onCheckedChange={(checked) => handleToggleIntegration(type as keyof typeof integrations, checked)}
                    />
                  </div>
                </CardHeader>
                {integrations[type as keyof typeof integrations].enabled && <CardContent>{renderConfigInputs(type as keyof typeof integrations)}</CardContent>}
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}
