// app/settings/help-support/docs/integration-guide/page.tsx

"use client"

import type React from "react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, LinkIcon, Search, ChevronRight } from "lucide-react"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useState } from "react"
import Image from "next/image"

export default function IntegrationGuidePage() {
    const [searchQuery, setSearchQuery] = useState("")

    return (
        <div className="space-y-6">
            <div className="flex items-center space-x-2">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/settings/help-support">
                        <ChevronLeft className="h-5 w-5" />
                    </Link>
                </Button>
                <h1 className="text-2xl sm:text-3xl font-bold">Integration Guide</h1>
            </div>

            <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <Input
                    placeholder="Search in integration guide..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="md:col-span-1 h-fit">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center space-x-2">
                            <LinkIcon className="h-5 w-5" />
                            <span>Contents</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ScrollArea className="h-[calc(100vh-300px)]">
                            <div className="space-y-1">
                                <TableOfContentsItem href="#introduction" label="Introduction" />
                                <TableOfContentsItem href="#getting-started" label="Getting Started" />
                                <TableOfContentsItem href="#api-integration" label="API Integration" />
                                <TableOfContentsItem href="#erp-integration" label="ERP Integration" isExpanded>
                                    <TableOfContentsItem href="#sap-integration" label="SAP Integration" level={2} />
                                    <TableOfContentsItem href="#oracle-integration" label="Oracle Integration" level={2} />
                                    <TableOfContentsItem href="#microsoft-dynamics" label="Microsoft Dynamics" level={2} />
                                </TableOfContentsItem>
                                <TableOfContentsItem href="#ecommerce-integration" label="E-commerce Integration" isExpanded>
                                    <TableOfContentsItem href="#shopify-integration" label="Shopify Integration" level={2} />
                                    <TableOfContentsItem href="#woocommerce-integration" label="WooCommerce Integration" level={2} />
                                    <TableOfContentsItem href="#magento-integration" label="Magento Integration" level={2} />
                                </TableOfContentsItem>
                                <TableOfContentsItem href="#warehouse-integration" label="Warehouse Management" />
                                <TableOfContentsItem href="#data-migration" label="Data Migration" />
                                <TableOfContentsItem href="#webhooks" label="Webhooks & Events" />
                                <TableOfContentsItem href="#troubleshooting" label="Troubleshooting" />
                            </div>
                        </ScrollArea>
                    </CardContent>
                </Card>

                <Card className="md:col-span-3">
                    <CardContent className="p-6">
                        <Tabs defaultValue="content" className="w-full">
                            <TabsList className="grid grid-cols-3 mb-6">
                                <TabsTrigger value="content">Content</TabsTrigger>
                                <TabsTrigger value="diagrams">Diagrams</TabsTrigger>
                                <TabsTrigger value="examples">Examples</TabsTrigger>
                            </TabsList>

                            <TabsContent value="content" className="space-y-8">
                                <section id="introduction" className="scroll-mt-16">
                                    <h2 className="text-2xl font-bold mb-4">Integration Guide Introduction</h2>
                                    <p className="text-muted-foreground mb-4">
                                        SupplyCycles is designed to integrate seamlessly with your existing systems and workflows. This guide provides comprehensive information on integrating SupplyCycles with various enterprise systems, e-commerce platforms, and third-party services.
                                    </p>
                                    <p className="text-muted-foreground mb-4">
                                        Whether you're looking to connect SupplyCycles with your ERP system, e-commerce platform, or warehouse management system, this guide will help you understand the integration options and best practices.
                                    </p>
                                    <div className="bg-muted p-4 rounded-lg">
                                        <h3 className="font-medium mb-2">Integration Methods</h3>
                                        <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                                            <li>RESTful API integration</li>
                                            <li>Pre-built connectors for popular systems</li>
                                            <li>Webhook-based event integration</li>
                                            <li>Data import/export tools</li>
                                            <li>Custom integration development</li>
                                        </ul>
                                    </div>
                                </section>

                                <section id="getting-started" className="scroll-mt-16">
                                    <h2 className="text-2xl font-bold mb-4">Getting Started with Integration</h2>
                                    <p className="text-muted-foreground mb-4">
                                        Before beginning any integration project with SupplyCycles, it's important to plan and prepare properly. This section covers the key steps to get started with your integration.
                                    </p>

                                    <h3 className="text-xl font-medium mt-6 mb-3">Integration Planning</h3>
                                    <ol className="list-decimal list-inside space-y-2 text-muted-foreground mb-6">
                                        <li>Identify your integration requirements and goals</li>
                                        <li>Determine which systems need to be integrated with SupplyCycles</li>
                                        <li>Map out the data flows between systems</li>
                                        <li>Identify the integration method for each system</li>
                                        <li>Establish a timeline and resource allocation for the integration project</li>
                                    </ol>

                                    <h3 className="text-xl font-medium mt-6 mb-3">API Access Setup</h3>
                                    <p className="text-muted-foreground mb-4">
                                        To use the SupplyCycles API for integration:
                                    </p>
                                    <ol className="list-decimal list-inside space-y-2 text-muted-foreground mb-6">
                                        <li>Log in to your SupplyCycles account</li>
                                        <li>Navigate to Settings {`>`} API & Integrations</li>
                                        <li>Generate an API key with appropriate permissions</li>
                                        <li>Store your API key securely</li>
                                        <li>Review the API documentation for endpoint details</li>
                                    </ol>

                                    <div className="bg-muted p-4 rounded-lg">
                                        <h3 className="font-medium mb-2">Integration Environment</h3>
                                        <p className="text-sm text-muted-foreground mb-2">
                                            SupplyCycles provides separate environments for testing and production:
                                        </p>
                                        <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                                            <li><span className="font-medium">Sandbox Environment:</span> Use for testing integrations without affecting production data</li>
                                            <li><span className="font-medium">Production Environment:</span> The live environment for your actual business operations</li>
                                        </ul>
                                        <p className="text-sm text-muted-foreground mt-2">
                                            Always test your integrations thoroughly in the sandbox environment before deploying to production.
                                        </p>
                                    </div>
                                </section>

                                <section id="api-integration" className="scroll-mt-16">
                                    <h2 className="text-2xl font-bold mb-4">API Integration</h2>
                                    <p className="text-muted-foreground mb-4">
                                        The SupplyCycles API is the most flexible way to integrate with external systems. This section covers the key aspects of API integration.
                                    </p>

                                    <div className="relative w-full h-64 rounded-lg overflow-hidden mb-6">
                                        <Image
                                            src="/placeholder.svg?height=400&width=800"
                                            alt="API Integration Diagram"
                                            fill
                                            className="object-cover"
                                        />
                                    </div>

                                    <h3 className="text-xl font-medium mt-6 mb-3">API Integration Patterns</h3>
                                    <div className="space-y-4 mb-6">
                                        <div className="border rounded-lg p-4">
                                            <h4 className="font-medium mb-2">Real-time Integration</h4>
                                            <p className="text-sm text-muted-foreground">
                                                Real-time integration involves making API calls as events occur in your systems. This approach ensures that data is always up-to-date across all systems.
                                            </p>
                                            <p className="text-sm text-muted-foreground mt-2">
                                                <span className="font-medium">Best for:</span> Order processing, inventory updates, and other time-sensitive operations.
                                            </p>
                                        </div>

                                        <div className="border rounded-lg p-4">
                                            <h4 className="font-medium mb-2">Batch Integration</h4>
                                            <p className="text-sm text-muted-foreground">
                                                Batch integration involves collecting data over a period of time and then synchronizing it in batches. This approach is more efficient for large volumes of data.
                                            </p>
                                            <p className="text-sm text-muted-foreground mt-2">
                                                <span className="font-medium">Best for:</span> Product catalog updates, customer data synchronization, and reporting.
                                            </p>
                                        </div>

                                        <div className="border rounded-lg p-4">
                                            <h4 className="font-medium mb-2">Hybrid Integration</h4>
                                            <p className="text-sm text-muted-foreground">
                                                Hybrid integration combines real-time and batch processing based on the specific requirements of each data type.
                                            </p>
                                            <p className="text-sm text-muted-foreground mt-2">
                                                <span className="font-medium">Best for:</span> Complex integrations with varying data synchronization needs.
                                            </p>
                                        </div>
                                    </div>

                                    <h3 className="text-xl font-medium mt-6 mb-3">API Best Practices</h3>
                                    <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                                        <li>Implement proper error handling and retry logic</li>
                                        <li>Use pagination for large data sets</li>
                                        <li>Respect rate limits to avoid throttling</li>
                                        <li>Implement proper authentication and keep API keys secure</li>
                                        <li>Log API requests and responses for troubleshooting</li>
                                        <li>Consider using webhooks for event-driven updates</li>
                                    </ul>
                                </section>

                                <section id="erp-integration" className="scroll-mt-16">
                                    <h2 className="text-2xl font-bold mb-4">ERP Integration</h2>
                                    <p className="text-muted-foreground mb-4">
                                        Integrating SupplyCycles with your Enterprise Resource Planning (ERP) system allows for seamless data flow between your core business processes and supply chain management.
                                    </p>

                                    <h3 id="sap-integration" className="text-xl font-medium mt-6 mb-3 scroll-mt-16">SAP Integration</h3>
                                    <p className="text-muted-foreground mb-4">
                                        SupplyCycles offers several options for integrating with SAP systems:
                                    </p>
                                    <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
                                        <li><span className="font-medium">SAP Connector:</span> Pre-built connector for SAP ERP and S/4HANA</li>
                                        <li><span className="font-medium">OData API:</span> Integration via SAP's OData services</li>
                                        <li><span className="font-medium">BAPI Integration:</span> Direct integration with SAP BAPIs</li>
                                        <li><span className="font-medium">IDocs:</span> Integration using SAP's IDoc format for data exchange</li>
                                    </ul>

                                    <h3 id="oracle-integration" className="text-xl font-medium mt-6 mb-3 scroll-mt-16">Oracle Integration</h3>
                                    <p className="text-muted-foreground mb-4">
                                        For Oracle ERP systems, SupplyCycles provides these integration options:
                                    </p>
                                    <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
                                        <li><span className="font-medium">Oracle Connector:</span> Pre-built connector for Oracle ERP Cloud and E-Business Suite</li>
                                        <li><span className="font-medium">REST API:</span> Integration via Oracle's REST APIs</li>
                                        <li><span className="font-medium">Oracle Integration Cloud:</span> Using OIC for seamless integration</li>
                                        <li><span className="font-medium">Database Integration:</span> Direct database integration for specific use cases</li>
                                    </ul>

                                    <h3 id="microsoft-dynamics" className="text-xl font-medium mt-6 mb-3 scroll-mt-16">Microsoft Dynamics Integration</h3>
                                    <p className="text-muted-foreground">
                                        SupplyCycles integrates with Microsoft Dynamics through:
                                    </p>
                                    <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                                        <li><span className="font-medium">Dynamics Connector:</span> Pre-built connector for Dynamics 365</li>
                                        <li><span className="font-medium">Web API:</span> Integration via Dynamics Web API</li>
                                        <li><span className="font-medium">Power Automate:</span> Using Microsoft Power Automate for workflow integration</li>
                                        <li><span className="font-medium">Azure Logic Apps:</span> Integration through Azure Logic Apps</li>
                                    </ul>
                                </section>

                                <div className="flex justify-between mt-8 pt-4 border-t">
                                    <Button variant="outline" disabled>
                                        Previous
                                    </Button>
                                    <Button asChild>
                                        <Link href="#ecommerce-integration">
                                            Next <ChevronRight className="ml-2 h-4 w-4" />
                                        </Link>
                                    </Button>
                                </div>
                            </TabsContent>

                            <TabsContent value="diagrams" className="space-y-6">
                                <h2 className="text-2xl font-bold mb-4">Integration Diagrams</h2>
                                <p className="text-muted-foreground mb-6">
                                    These diagrams illustrate the integration architecture and data flows between SupplyCycles and external systems.
                                </p>

                                <div className="space-y-8">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>API Integration Architecture</CardTitle>
                                            <CardDescription>Overview of SupplyCycles API integration architecture</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="relative h-80 w-full rounded-lg overflow-hidden">
                                                <Image
                                                    src="/placeholder.svg?height=400&width=800"
                                                    alt="API Integration Architecture"
                                                    fill
                                                    className="object-contain"
                                                />
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardHeader>
                                            <CardTitle>ERP Integration Flow</CardTitle>
                                            <CardDescription>Data flow between SupplyCycles and ERP systems</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="relative h-80 w-full rounded-lg overflow-hidden">
                                                <Image
                                                    src="/placeholder.svg?height=400&width=800"
                                                    alt="ERP Integration Flow"
                                                    fill
                                                    className="object-contain"
                                                />
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardHeader>
                                            <CardTitle>E-commerce Integration</CardTitle>
                                            <CardDescription>Integration between SupplyCycles and e-commerce platforms</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="relative h-80 w-full rounded-lg overflow-hidden">
                                                <Image
                                                    src="/placeholder.svg?height=400&width=800"
                                                    alt="E-commerce Integration"
                                                    fill
                                                    className="object-contain"
                                                />
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Webhook Event Flow</CardTitle>
                                            <CardDescription>Event-driven integration using webhooks</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="relative h-80 w-full rounded-lg overflow-hidden">
                                                <Image
                                                    src="/placeholder.svg?height=400&width=800"
                                                    alt="Webhook Event Flow"
                                                    fill
                                                    className="object-contain"
                                                />
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </TabsContent>

                            <TabsContent value="examples" className="space-y-6">
                                <h2 className="text-2xl font-bold mb-4">Integration Examples</h2>
                                <p className="text-muted-foreground mb-6">
                                    These examples demonstrate common integration scenarios with SupplyCycles.
                                </p>

                                <div className="space-y-6">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Example 1: Order Synchronization</CardTitle>
                                            <CardDescription>Synchronizing orders between SupplyCycles and an ERP system</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-4">
                                                <h3 className="font-medium">Integration Scenario</h3>
                                                <p className="text-sm text-muted-foreground">
                                                    This example demonstrates how to synchronize orders between SupplyCycles and an ERP system in real-time, ensuring that order data is consistent across both systems.
                                                </p>

                                                <h3 className="font-medium mt-4">Implementation Steps</h3>
                                                <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                                                    <li>Configure webhook in SupplyCycles to trigger on new order creation</li>
                                                    <li>Set up an API endpoint in your integration service to receive the webhook</li>
                                                    <li>Process the order data and transform it to match your ERP's format</li>
                                                    <li>Use your ERP's API to create the order in the ERP system</li>
                                                    <li>Update the order in SupplyCycles with the ERP order reference</li>
                                                    <li>Implement error handling and retry logic for failed synchronizations</li>
                                                </ol>

                                                <h3 className="font-medium mt-4">Code Example</h3>
                                                <code className="block bg-background p-3 rounded border text-sm font-mono overflow-x-auto">
                                                    {`// Example webhook handler for order synchronization
app.post('/webhooks/supplycycles/orders', async (req, res) => {
  try {
    // Validate webhook signature
    const isValid = validateWebhookSignature(req);
    if (!isValid) {
      return res.status(401).send('Invalid signature');
    }
    
    // Extract order data from webhook payload
    const { order } = req.body;
    
    // Transform order data for ERP
    const erpOrderData = transformOrderForERP(order);
    
    // Send order to ERP
    const erpResponse = await sendOrderToERP(erpOrderData);
    
    // Update SupplyCycles with ERP reference
    await updateSupplyCyclesOrder(order.id, {
      erpOrderId: erpResponse.orderId,
      erpSyncStatus: 'SYNCED'
    });
    
    res.status(200).send('Order synchronized successfully');
  } catch (error) {
    console.error('Order sync error:', error);
    
    // Log error and queue for retry
    await logSyncError(error, 'ORDER_SYNC', req.body);
    await queueForRetry('ORDER_SYNC', req.body);
    
    res.status(500).send('Error processing order');
  }
});`}
                                                </code>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Example 2: Inventory Synchronization</CardTitle>
                                            <CardDescription>Keeping inventory levels in sync across systems</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-4">
                                                <h3 className="font-medium">Integration Scenario</h3>
                                                <p className="text-sm text-muted-foreground">
                                                    This example shows how to implement bidirectional inventory synchronization between SupplyCycles and a warehouse management system (WMS).
                                                </p>

                                                <h3 className="font-medium mt-4">Implementation Steps</h3>
                                                <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                                                    <li>Set up scheduled inventory sync job to run every 15 minutes</li>
                                                    <li>Fetch updated inventory from WMS since last sync</li>
                                                    <li>Update inventory levels in SupplyCycles via API</li>
                                                    <li>Fetch inventory updates from SupplyCycles since last sync</li>
                                                    <li>Update inventory in WMS via its API</li>
                                                    <li>Log sync results and handle any conflicts</li>
                                                </ol>

                                                <h3 className="font-medium mt-4">Architecture Diagram</h3>
                                                <div className="relative h-60 w-full rounded-lg overflow-hidden my-4">
                                                    <Image
                                                        src="/placeholder.svg?height=300&width=800"
                                                        alt="Inventory Sync Architecture"
                                                        fill
                                                        className="object-contain"
                                                    />
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>
            </div>
        </div >
    )
}

interface TableOfContentsItemProps {
    href: string
    label: string
    level?: number
    isExpanded?: boolean
    children?: React.ReactNode
}

function TableOfContentsItem({ href, label, level = 1, isExpanded = false, children }: TableOfContentsItemProps) {
    const [expanded, setExpanded] = useState(isExpanded)
    const hasChildren = Boolean(children)

    return (
        <div className="space-y-1">
            <div className={`flex items-center ${level > 1 ? "pl-4" : ""}`}>
                {hasChildren && (
                    <Button variant="ghost" size="icon" className="h-5 w-5 p-0 mr-1" onClick={() => setExpanded(!expanded)}>
                        <ChevronRight className={`h-4 w-4 transition-transform ${expanded ? "rotate-90" : ""}`} />
                    </Button>
                )}
                <Link href={href} className={`text-sm hover:underline ${level > 1 ? "text-muted-foreground" : "font-medium"}`}>
                    {label}
                </Link>
            </div>
            {expanded && children && <div className="ml-2">{children}</div>}
        </div>
    )
}

