"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CarrierManagement } from "@/components/transport/CarrierManagement"
import { RouteManagement } from "@/components/transport/RouteManagement"
import { FreightManagement } from "@/components/transport/FreightManagement"

export function TransportManagement() {
    const [activeTab, setActiveTab] = useState("carriers")

    return (
        <div>
            <h2 className="text-2xl font-bold mb-4">Transportation Management</h2>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="w-full mb-8 flex flex-wrap justify-start">
                    <TabsTrigger value="carriers">Carriers</TabsTrigger>
                    <TabsTrigger value="routes">Routes</TabsTrigger>
                    <TabsTrigger value="freight">Freight</TabsTrigger>
                </TabsList>
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

