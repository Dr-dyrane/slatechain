"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CarrierManagement } from "@/components/transport/CarrierManagement"
import { RouteManagement } from "@/components/transport/RouteManagement"
import { FreightManagement } from "@/components/transport/FreightManagement"
import { TransitManagement } from "@/components/transport/TransitManagement"

export function TransportManagement() {
    const [activeTab, setActiveTab] = useState("transport")

    return (
        <div>
            <h2 className="text-2xl font-bold mb-4">Transportation Management</h2>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="w-full grid grid-cols-2 md:grid-cols-4 gap-2 mb-2 md:mb-8">
                    <TabsTrigger value="transport">Transport</TabsTrigger>
                    <TabsTrigger value="carriers">Carriers</TabsTrigger>
                    <TabsTrigger className="hidden md:flex" value="routes">Routes</TabsTrigger>
                    <TabsTrigger className="hidden md:flex" value="freight">Freight</TabsTrigger>
                </TabsList>
                <TabsList className="w-full md:hidden grid grid-cols-2 gap-2 mb-8">
                    <TabsTrigger value="routes">Routes</TabsTrigger>
                    <TabsTrigger value="freight">Freight</TabsTrigger>
                </TabsList>
                <TabsContent value="transport">
                    <TransitManagement />
                </TabsContent>
                <TabsContent value="carriers">
                    <CarrierManagement />
                </TabsContent>
                <TabsContent value="routes">
                    <RouteManagement />
                </TabsContent>
                <TabsContent value="freight">
                    <FreightManagement />
                </TabsContent>

            </Tabs>
        </div>
    )
}

