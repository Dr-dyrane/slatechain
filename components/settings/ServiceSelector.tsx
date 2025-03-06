"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { ChevronLeft, Eye, EyeOff, Save } from "lucide-react"
import Image from "next/image"
import { motion } from "framer-motion"
import type {
    UserIntegrations,
    EcommerceIntegration,
    ErpCrmIntegration,
    IoTIntegration,
    BIIntegration,
} from "@/lib/types"

type IntegrationCategory = keyof UserIntegrations
type IntegrationData = EcommerceIntegration | ErpCrmIntegration | IoTIntegration | BIIntegration

// Define the structure of a service entry
interface ServiceEntry {
    id: string
    name: string
    logo: string
}

// Type for the services object - now more flexible and type-safe
export interface Services {
    ecommerce: ServiceEntry[]
    erp_crm: ServiceEntry[]
    iot: ServiceEntry[]
    bi_tools: ServiceEntry[]
    auth: ServiceEntry[] // Add auth here if needed
}

interface ServiceSelectorProps {
    category: IntegrationCategory
    onBack: () => void
    integration: IntegrationData | undefined
    onSave: (service: string, apiKey: string, url?: string) => void
    onToggle: (enabled: boolean) => void
}

// Define services with the correct type
const services: Services = {
    ecommerce: [{ id: "shopify", name: "Shopify", logo: "/icons/shopify.svg" }],
    erp_crm: [{ id: "sap", name: "SAP", logo: "/icons/sap.svg" }],
    iot: [{ id: "iot_monitoring", name: "IoT Monitoring", logo: "/icons/iot.svg" }],
    bi_tools: [{ id: "power_bi", name: "Power BI", logo: "/icons/powerbi.svg" }],
    auth: [], // Initialize auth, even if empty
}

// Type guard to narrow down IntegrationData based on category
function getIntegrationData(
    category: IntegrationCategory,
    data: IntegrationData | undefined,
): IntegrationData | undefined {
    switch (category) {
        case "ecommerce":
            return data as EcommerceIntegration | undefined
        case "erp_crm":
            return data as ErpCrmIntegration | undefined
        case "iot":
            return data as IoTIntegration | undefined
        case "bi_tools":
            return data as BIIntegration | undefined
        default:
            return undefined
    }
}

export function ServiceSelector({ category, onBack, integration, onSave, onToggle }: ServiceSelectorProps) {
    const [showApiKey, setShowApiKey] = useState(false)
    const availableServices = services[category] || [] // Now type-safe
    const typedIntegration = getIntegrationData(category, integration) // Use type guard here

    // Track the currently selected service (from existing integration or new selection)
    const [selectedServiceId, setSelectedServiceId] = useState<string | null>(typedIntegration?.service || null)

    // Track if the integration is connected
    const isConnected = typedIntegration?.enabled || false
    const [localEnabled, setLocalEnabled] = useState(isConnected)

    // Form state for API key and store URL
    const [apiKey, setApiKey] = useState(typedIntegration?.apiKey || "")
    const [storeUrl, setStoreUrl] = useState(
        category === "ecommerce" && typedIntegration && "storeUrl" in typedIntegration
            ? typedIntegration.storeUrl || ""
            : "",
    )

    // Track if we're in edit mode (showing the form)
    const [isEditMode, setIsEditMode] = useState(false)

    // Update local state when integration changes
    useEffect(() => {
        setSelectedServiceId(typedIntegration?.service || null)
        setLocalEnabled(typedIntegration?.enabled || false)
        setApiKey(typedIntegration?.apiKey || "")
        if (category === "ecommerce" && typedIntegration && "storeUrl" in typedIntegration) {
            setStoreUrl(typedIntegration.storeUrl || "")
        }
    }, [typedIntegration, category])

    // Handle service selection
    const handleSelectService = (serviceId: string) => {
        setSelectedServiceId(serviceId)
        setIsEditMode(true)

        // If this is a new service or different from current, reset form fields
        if (!typedIntegration || typedIntegration.service !== serviceId) {
            setApiKey("")
            setStoreUrl("")
        }
    }

    // Handle save
    const handleSave = () => {
        if (selectedServiceId) {
            onSave(selectedServiceId, apiKey, category === "ecommerce" ? storeUrl : undefined)
            setLocalEnabled(true)
            setIsEditMode(false)
        }
    }

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

                    {/* Toggle Connection - Only show if integration is saved and we're not in edit mode */}
                    {selectedServiceId && typedIntegration?.service === selectedServiceId && !isEditMode && (
                        <div className="flex items-center space-x-2">
                            <Label htmlFor="integration-toggle" className="text-sm">
                                {localEnabled ? "Connected" : "Disconnected"}
                            </Label>
                            <Switch
                                id="integration-toggle"
                                checked={localEnabled}
                                onCheckedChange={(checked) => {
                                    setLocalEnabled(checked)
                                    onToggle(checked)
                                }}
                            />
                        </div>
                    )}
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Only show services selection if not in edit mode */}
                    {!isEditMode && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {availableServices.map((service) => (
                                <motion.div key={service.id} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                    <Card
                                        className={`cursor-pointer relative ${selectedServiceId === service.id ? "ring-2 ring-primary" : ""}`}
                                        onClick={() => handleSelectService(service.id)}
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
                                                    {localEnabled && typedIntegration?.service === service.id
                                                        ? "Connected"
                                                        : "Click to configure"}
                                                </p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>
                    )}

                    {/* API Key Input & Store URL - Show in edit mode */}
                    {selectedServiceId && isEditMode && (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                            {/* Show selected service info */}
                            <div className="mb-6">
                                <h3 className="font-medium text-lg mb-2">
                                    Configure {availableServices.find((s) => s.id === selectedServiceId)?.name}
                                </h3>
                                <p className="text-sm text-muted-foreground">Enter your API credentials to connect this service.</p>
                            </div>

                            {/* API Key Field */}
                            <div className="space-y-2 relative">
                                <Label>API Key</Label>
                                <div className="relative">
                                    <Input
                                        type={showApiKey ? "text" : "password"}
                                        placeholder="Enter API Key"
                                        value={apiKey}
                                        onChange={(e) => setApiKey(e.target.value)}
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
                            {category === "ecommerce" && (
                                <div className="space-y-2">
                                    <Label>Store URL</Label>
                                    <Input placeholder="Enter Store URL" value={storeUrl} onChange={(e) => setStoreUrl(e.target.value)} />
                                </div>
                            )}
                        </motion.div>
                    )}
                </CardContent>

                {/* Add footer with save button when in edit mode */}
                {isEditMode && (
                    <CardFooter className="flex justify-end space-x-2 pt-2">
                        <Button variant="outline" onClick={() => setIsEditMode(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleSave} disabled={!apiKey}>
                            <Save className="h-4 w-4 mr-2" />
                            Connect Integration
                        </Button>
                    </CardFooter>
                )}
            </Card>
        </motion.div>
    )
}

