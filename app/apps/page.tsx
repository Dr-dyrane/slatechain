"use client";

import React, { Suspense, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store";
import ShopifyComponent from "./ShopifyComponent";


// Define available integrations (only Shopify exists for now)
const ecommerceServices: Record<string, React.FC | null> = {
  shopify: ShopifyComponent,
  woocommerce: null, // Future integration
  magento: null, // Future integration
  bigcommerce: null, // Future integration
};

// Placeholder for future integrations
const ComingSoonComponent = ({ service }: { service: string }) => (
    <div className="p-6 text-center">
        <h3 className="text-lg font-semibold">🚀 {service} Integration Coming Soon!</h3>
        <p className="text-sm text-muted-foreground">
            We’re working on adding support for {service}. Stay tuned!
        </p>
    </div>
);

export default function Apps() {
    const user = useSelector((state: RootState) => state.auth.user);
    const ecommerceService = user?.integrations?.ecommerce?.service; // Array of active services
    const [activeTab, setActiveTab] = useState(ecommerceService as string);

    return (
        <div className="space-y-6">
            <h1 className="text-2xl sm:text-3xl font-bold mb-4">Apps & Integrations</h1>
            <p className="text-muted-foreground mb-6">Manage your connected services.</p>


            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="w-full mb-10 flex flex-wrap justify-start">
                    {user?.integrations?.ecommerce?.enabled && ecommerceService && (
                        <TabsTrigger className="capitalize" value={ecommerceService as string}>{ecommerceService}</TabsTrigger>
                    )}
                </TabsList>

                  {/* Dynamically render the correct e-commerce component */}
                        {user?.integrations?.ecommerce?.enabled && ecommerceService && (
                          <TabsContent value={ecommerceService}>
                            {ecommerceServices[ecommerceService] ? (
                              React.createElement(ecommerceServices[ecommerceService] as React.FC)
                            ) : (
                              <ComingSoonComponent service={ecommerceService} />
                            )}
                          </TabsContent>
                        )}
            </Tabs>
        </div>
    );
}
