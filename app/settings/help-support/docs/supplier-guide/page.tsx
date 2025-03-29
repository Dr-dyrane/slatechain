// app/settings/help-support/docs/supplier-guide/page.tsx

"use client"

import type React from "react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, Users, Search, ChevronRight } from "lucide-react"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useState } from "react"
import Image from "next/image"

export default function SupplierGuidePage() {
  const [searchQuery, setSearchQuery] = useState("")

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/settings/help-support">
            <ChevronLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h1 className="text-2xl sm:text-3xl font-bold">Supplier Guide</h1>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search in supplier guide..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="md:col-span-1 h-fit">
          <CardHeader>
            <CardTitle className="text-lg flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Contents</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[calc(100vh-300px)]">
              <div className="space-y-1">
                <TableOfContentsItem href="#introduction" label="Introduction" />
                <TableOfContentsItem href="#getting-started" label="Getting Started" />
                <TableOfContentsItem href="#supplier-portal" label="Supplier Portal" isExpanded>
                  <TableOfContentsItem href="#dashboard" label="Dashboard" level={2} />
                  <TableOfContentsItem href="#orders" label="Orders" level={2} />
                  <TableOfContentsItem href="#inventory" label="Inventory" level={2} />
                </TableOfContentsItem>
                <TableOfContentsItem href="#communication" label="Communication" isExpanded>
                  <TableOfContentsItem href="#messaging" label="Messaging" level={2} />
                  <TableOfContentsItem href="#notifications" label="Notifications" level={2} />
                </TableOfContentsItem>
                <TableOfContentsItem href="#documents" label="Document Management" />
                <TableOfContentsItem href="#invoicing" label="Invoicing" />
                <TableOfContentsItem href="#performance" label="Performance Metrics" />
                <TableOfContentsItem href="#blockchain" label="Blockchain Authentication" />
                <TableOfContentsItem href="#troubleshooting" label="Troubleshooting" />
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        <Card className="md:col-span-3">
          <CardContent className="p-6">
            <Tabs defaultValue="content" className="w-full">
              <TabsList className="grid grid-cols-2 mb-6">
                <TabsTrigger value="content">Content</TabsTrigger>
                <TabsTrigger value="examples">Examples</TabsTrigger>
              </TabsList>

              <TabsContent value="content" className="space-y-8">
                <section id="introduction" className="scroll-mt-16">
                  <h2 className="text-2xl font-bold mb-4">Introduction to the Supplier Portal</h2>
                  <p className="text-muted-foreground mb-4">
                    Welcome to the SlateChain Supplier Guide. This comprehensive resource is designed to help suppliers
                    effectively use the SlateChain platform to manage orders, inventory, documents, and communication
                    with buyers.
                  </p>
                  <p className="text-muted-foreground mb-4">
                    As a supplier on SlateChain, you have access to powerful tools that streamline collaboration,
                    increase visibility, and improve efficiency in your supply chain operations.
                  </p>
                  <div className="bg-muted p-4 rounded-lg">
                    <h3 className="font-medium mb-2">Key Benefits for Suppliers</h3>
                    <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                      <li>Real-time visibility into orders and forecasts</li>
                      <li>Streamlined communication with buyers</li>
                      <li>Simplified document management</li>
                      <li>Automated invoicing and payment tracking</li>
                      <li>Performance analytics and insights</li>
                      <li>Secure blockchain authentication</li>
                    </ul>
                  </div>
                </section>

                <section id="getting-started" className="scroll-mt-16">
                  <h2 className="text-2xl font-bold mb-4">Getting Started</h2>
                  <p className="text-muted-foreground mb-4">
                    To get started as a supplier on SlateChain, you'll need to complete the onboarding process and set
                    up your account.
                  </p>

                  <div className="relative w-full h-64 rounded-lg overflow-hidden mb-6">
                    <Image
                      src="/placeholder.svg?height=400&width=800"
                      alt="Supplier Onboarding"
                      fill
                      className="object-cover"
                    />
                  </div>

                  <h3 className="text-xl font-medium mt-6 mb-3">Account Setup</h3>
                  <p className="text-muted-foreground mb-4">
                    After receiving an invitation from a buyer, follow these steps to set up your supplier account:
                  </p>
                  <ol className="list-decimal list-inside space-y-2 text-muted-foreground mb-4">
                    <li>Click the invitation link in the email you received</li>
                    <li>Create your account with a secure password</li>
                    <li>Complete your company profile with accurate information</li>
                    <li>Upload required documents for verification</li>
                    <li>Set up your payment information</li>
                    <li>Configure notification preferences</li>
                  </ol>

                  <h3 className="text-xl font-medium mt-6 mb-3">Navigation Basics</h3>
                  <p className="text-muted-foreground mb-4">
                    The SlateChain supplier portal consists of several key areas:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li>
                      <span className="font-medium">Dashboard:</span> Overview of key metrics and recent activity
                    </li>
                    <li>
                      <span className="font-medium">Orders:</span> Manage purchase orders from buyers
                    </li>
                    <li>
                      <span className="font-medium">Inventory:</span> Track and manage your product inventory
                    </li>
                    <li>
                      <span className="font-medium">Documents:</span> Store and share important documents
                    </li>
                    <li>
                      <span className="font-medium">Messages:</span> Communicate with buyers
                    </li>
                    <li>
                      <span className="font-medium">Invoices:</span> Manage invoices and payment status
                    </li>
                  </ul>
                </section>

                <section id="supplier-portal" className="scroll-mt-16">
                  <h2 className="text-2xl font-bold mb-4">Supplier Portal</h2>
                  <p className="text-muted-foreground mb-4">
                    The supplier portal is your central hub for managing all aspects of your relationship with buyers on
                    SlateChain.
                  </p>

                  <h3 id="dashboard" className="text-xl font-medium mt-6 mb-3 scroll-mt-16">
                    Dashboard
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Your dashboard provides a quick overview of your supply chain operations with key metrics and
                    actionable insights:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
                    <li>
                      <span className="font-medium">Order Summary:</span> View pending, in-progress, and completed
                      orders
                    </li>
                    <li>
                      <span className="font-medium">Performance Metrics:</span> Track on-time delivery, quality ratings,
                      and response times
                    </li>
                    <li>
                      <span className="font-medium">Alerts:</span> See important notifications requiring attention
                    </li>
                    <li>
                      <span className="font-medium">Recent Activity:</span> View recent orders, messages, and document
                      updates
                    </li>
                  </ul>

                  <h3 id="orders" className="text-xl font-medium mt-6 mb-3 scroll-mt-16">
                    Orders
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    The Orders section allows you to manage purchase orders from buyers:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
                    <li>
                      <span className="font-medium">View Orders:</span> See all orders with filtering and sorting
                      options
                    </li>
                    <li>
                      <span className="font-medium">Order Details:</span> View complete order information including line
                      items, delivery dates, and special instructions
                    </li>
                    <li>
                      <span className="font-medium">Order Acknowledgment:</span> Confirm receipt and acceptance of
                      orders
                    </li>
                    <li>
                      <span className="font-medium">Order Updates:</span> Provide status updates and shipping
                      information
                    </li>
                    <li>
                      <span className="font-medium">Order History:</span> Access a complete history of past orders
                    </li>
                  </ul>

                  <h3 id="inventory" className="text-xl font-medium mt-6 mb-3 scroll-mt-16">
                    Inventory
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    The Inventory section helps you manage your product catalog and stock levels:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li>
                      <span className="font-medium">Product Catalog:</span> Manage your product listings with detailed
                      information
                    </li>
                    <li>
                      <span className="font-medium">Inventory Levels:</span> Update and track current stock levels
                    </li>
                    <li>
                      <span className="font-medium">Inventory Forecasting:</span> View projected inventory needs based
                      on buyer forecasts
                    </li>
                    <li>
                      <span className="font-medium">Low Stock Alerts:</span> Receive notifications when inventory levels
                      are low
                    </li>
                  </ul>
                </section>

                <div className="flex justify-between mt-8 pt-4 border-t">
                  <Button variant="outline" disabled>
                    Previous
                  </Button>
                  <Button asChild>
                    <Link href="#communication">
                      Next <ChevronRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="examples" className="space-y-6">
                <h2 className="text-2xl font-bold mb-4">Supplier Examples</h2>
                <p className="text-muted-foreground mb-6">
                  These examples demonstrate common supplier tasks in SlateChain.
                </p>

                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Example 1: Processing a New Order</CardTitle>
                      <CardDescription>How to receive and process a new purchase order</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                        <li>Receive notification of a new purchase order</li>
                        <li>Navigate to the Orders section and locate the new order</li>
                        <li>Review order details including products, quantities, and delivery dates</li>
                        <li>Check inventory availability for the requested items</li>
                        <li>Acknowledge the order by clicking "Accept Order"</li>
                        <li>Update the order status as you process it</li>
                        <li>Generate shipping documents when ready to ship</li>
                        <li>Update the order with tracking information once shipped</li>
                      </ol>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Example 2: Updating Product Information</CardTitle>
                      <CardDescription>How to update your product catalog</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                        <li>Navigate to the Inventory section</li>
                        <li>Select the product you want to update</li>
                        <li>Click "Edit Product" to modify product details</li>
                        <li>Update information such as description, specifications, or pricing</li>
                        <li>Upload new product images if needed</li>
                        <li>Update inventory levels if they've changed</li>
                        <li>Save changes to update the product information</li>
                        <li>Buyers will automatically see the updated information</li>
                      </ol>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Example 3: Communicating with a Buyer</CardTitle>
                      <CardDescription>How to use the messaging system to communicate with buyers</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                        <li>Navigate to the Messages section</li>
                        <li>Select the buyer you want to communicate with</li>
                        <li>View the message history with that buyer</li>
                        <li>Compose a new message with a clear subject line</li>
                        <li>Attach any relevant documents or images</li>
                        <li>Send the message and wait for a response</li>
                        <li>Receive notifications when the buyer responds</li>
                        <li>Continue the conversation as needed</li>
                      </ol>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
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

