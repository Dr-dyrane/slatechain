"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ChevronLeft, Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import { motion } from "framer-motion";
import type {
    UserIntegrations,
    EcommerceIntegration,
    ErpCrmIntegration,
    IoTIntegration,
    BIIntegration,
} from "@/lib/types";

type IntegrationCategory = keyof UserIntegrations;
type IntegrationData = EcommerceIntegration | ErpCrmIntegration | IoTIntegration | BIIntegration;

interface ServiceSelectorProps {
    category: IntegrationCategory;
    onBack: () => void;
    integration: IntegrationData | undefined;
    onSave: (service: string, apiKey: string, url?: string) => void;
    onToggle: (enabled: boolean) => void;
}

const services = {
    ecommerce: [{ id: "shopify", name: "Shopify", logo: "/icons/shopify.svg" }],
    erp_crm: [{ id: "sap", name: "SAP", logo: "/icons/sap.svg" }],
    iot: [{ id: "iot_monitoring", name: "IoT Monitoring", logo: "/icons/iot.svg" }],
    bi_tools: [{ id: "power_bi", name: "Power BI", logo: "/icons/powerbi.svg" }],
} as const;

export function ServiceSelector({ category, onBack, integration, onSave, onToggle }: ServiceSelectorProps) {
    const [showApiKey, setShowApiKey] = useState(false);
    const availableServices = services[category] || [];
    const selectedService = integration?.service;
    const isConnected = integration?.enabled || false;
    const [localEnabled, setLocalEnabled] = useState(isConnected);

    useEffect(() => {
        const timeout = setTimeout(() => {
            setLocalEnabled(isConnected);
        }, 3000); // Adjust the delay as needed

        return () => clearTimeout(timeout);
    }, [localEnabled]);


    return (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between flex-wrap">
                    <div className="flex items-center space-x-4">
                        <Button variant="ghost" size="icon" onClick={onBack}>
                            <ChevronLeft className="h-5 w-5" />
                        </Button>
                        <CardTitle>Select Service</CardTitle>
                    </div>

                    {/* Toggle Connection */}
                    {selectedService && (
                        <div className="flex items-center space-x-2">
                            <Label htmlFor="integration-toggle" className="text-sm">
                                {localEnabled ? "Connected" : "Disconnected"}
                            </Label>
                            <Switch
                                id="integration-toggle"
                                checked={localEnabled} // Use local state for UI feedback
                                onCheckedChange={(checked) => {
                                    setLocalEnabled(checked); // Instantly reflect change in UI
                                    onToggle(checked); // Update Redux state/backend
                                }}
                            />
                        </div>
                    )}
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {availableServices.map((service) => (
                            <motion.div key={service.id} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                <Card
                                    className={`cursor-pointer relative ${selectedService === service.id ? "ring-2 ring-primary" : ""}`}
                                    onClick={() => {
                                        if (!localEnabled || integration?.service !== service.id) {
                                            onSave(service.id, "", "");
                                        }
                                        setLocalEnabled(true);
                                    }}
                                >
                                    <CardContent className="p-4 flex items-center space-x-4">
                                        <div className="h-12 w-12 relative">
                                            <Image
                                                src={service.logo || "/placeholder.svg"}
                                                alt={service.name}
                                                fill
                                                className="object-contain"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-medium">{service.name}</h3>
                                            <p className="text-sm text-muted-foreground">
                                                {localEnabled && integration?.service === service.id ? "Connected" : "Click to connect"}
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>

                    {/* API Key Input & Store URL */}
                    {selectedService && localEnabled && (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                            {/* API Key Field */}
                            <div className="space-y-2 relative">
                                <Label>API Key</Label>
                                <div className="relative">
                                    <Input
                                        type={showApiKey ? "text" : "password"}
                                        placeholder="Enter API Key"
                                        value={integration?.apiKey || ""}
                                        onChange={(e) =>
                                            onSave(selectedService, e.target.value, "storeUrl" in integration ? integration.storeUrl as string | undefined : undefined)
                                        }
                                        className="pr-10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowApiKey((prev) => !prev)}
                                        className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
                                    >
                                        {showApiKey ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    </button>
                                </div>
                            </div>

                            {/* Store URL for Ecommerce */}
                            {category === "ecommerce" && "storeUrl" in integration && (
                                <div className="space-y-2">
                                    <Label>Store URL</Label>
                                    <Input
                                        placeholder="Enter Store URL"
                                        value={integration.storeUrl || ""}
                                        onChange={(e) => onSave(selectedService, integration.apiKey || "", e.target.value)}
                                    />
                                </div>
                            )}
                        </motion.div>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    );
}
