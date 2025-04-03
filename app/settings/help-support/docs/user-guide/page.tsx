// app/settings/help-support/docs/user-guide/page.tsx

"use client"

import type React from "react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, BookOpen, Search, ChevronRight } from "lucide-react"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useState } from "react"

export default function UserGuidePage() {
  const [searchQuery, setSearchQuery] = useState("")

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/settings/help-support">
            <ChevronLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h1 className="text-2xl sm:text-3xl font-bold">User Guide</h1>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search in user guide..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="md:col-span-1 h-fit">
          <CardHeader>
            <CardTitle className="text-lg flex items-center space-x-2">
              <BookOpen className="h-5 w-5" />
              <span>Contents</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[calc(100vh-300px)]">
              <div className="space-y-1">
                <TableOfContentsItem href="#introduction" label="Introduction" />
                <TableOfContentsItem href="#getting-started" label="Getting Started" />
                <TableOfContentsItem href="#dashboard" label="Dashboard" />
                <TableOfContentsItem href="#inventory" label="Inventory Management" isExpanded>
                  <TableOfContentsItem href="#inventory-overview" label="Overview" level={2} />
                  <TableOfContentsItem href="#adding-products" label="Adding Products" level={2} />
                  <TableOfContentsItem href="#stock-management" label="Stock Management" level={2} />
                </TableOfContentsItem>
                <TableOfContentsItem href="#orders" label="Order Management" isExpanded>
                  <TableOfContentsItem href="#creating-orders" label="Creating Orders" level={2} />
                  <TableOfContentsItem href="#tracking-orders" label="Tracking Orders" level={2} />
                  <TableOfContentsItem href="#order-fulfillment" label="Order Fulfillment" level={2} />
                </TableOfContentsItem>
                <TableOfContentsItem href="#suppliers" label="Supplier Management" />
                <TableOfContentsItem href="#reports" label="Reports and Analytics" />
                <TableOfContentsItem href="#settings" label="Account Settings" />
                <TableOfContentsItem href="#integrations" label="Integrations" />
                <TableOfContentsItem href="#mobile" label="Mobile App" />
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
                  <h2 className="text-2xl font-bold mb-4">Introduction to SupplyCycles</h2>
                  <p className="text-muted-foreground mb-4">
                    Welcome to SupplyCycles, your comprehensive supply chain management platform. This user guide will
                    help you navigate the various features and functionalities of SupplyCycles to optimize your supply
                    chain operations.
                  </p>
                  <p className="text-muted-foreground mb-4">
                    SupplyCycles is designed to streamline inventory management, order processing, supplier relationships,
                    and logistics tracking in one integrated platform. Whether you're a small business or a large
                    enterprise, SupplyCycles provides the tools you need to manage your supply chain efficiently.
                  </p>
                  <div className="bg-muted p-4 rounded-lg">
                    <h3 className="font-medium mb-2">Key Features</h3>
                    <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                      <li>Comprehensive inventory management</li>
                      <li>Order tracking and management</li>
                      <li>Supplier collaboration tools</li>
                      <li>Real-time analytics and reporting</li>
                      <li>Integration capabilities with existing systems</li>
                      <li>Secure blockchain authentication</li>
                      <li>Mobile access for on-the-go management</li>
                    </ul>
                  </div>
                </section>

                <section id="getting-started" className="scroll-mt-16">
                  <h2 className="text-2xl font-bold mb-4">Getting Started</h2>
                  <p className="text-muted-foreground mb-4">
                    To get started with SupplyCycles, you'll need to set up your account and configure your basic
                    settings. This section will guide you through the initial setup process.
                  </p>

                  <h3 className="text-xl font-medium mt-6 mb-3">Account Setup</h3>
                  <p className="text-muted-foreground mb-4">
                    After registering and logging in, you'll be prompted to complete your account setup. This includes:
                  </p>
                  <ol className="list-decimal list-inside space-y-2 text-muted-foreground mb-4">
                    <li>Completing your company profile</li>
                    <li>Setting up user roles and permissions</li>
                    <li>Configuring notification preferences</li>
                    <li>Setting up your inventory categories</li>
                  </ol>

                  <h3 className="text-xl font-medium mt-6 mb-3">Navigation Basics</h3>
                  <p className="text-muted-foreground mb-4">The SupplyCycles interface consists of several key areas:</p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li>
                      <span className="font-medium">Navigation Sidebar:</span> Access different sections of the
                      application
                    </li>
                    <li>
                      <span className="font-medium">Dashboard:</span> View key metrics and recent activity
                    </li>
                    <li>
                      <span className="font-medium">Header Bar:</span> Access notifications, user settings, and help
                      resources
                    </li>
                    <li>
                      <span className="font-medium">Main Content Area:</span> View and interact with the selected
                      section
                    </li>
                  </ul>
                </section>

                <section id="dashboard" className="scroll-mt-16">
                  <h2 className="text-2xl font-bold mb-4">Dashboard</h2>
                  <p className="text-muted-foreground mb-4">
                    The dashboard provides a quick overview of your supply chain operations with key metrics and
                    actionable insights.
                  </p>

                  <h3 className="text-xl font-medium mt-6 mb-3">Dashboard Components</h3>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
                    <li>
                      <span className="font-medium">KPI Cards:</span> Display key performance indicators like inventory
                      value, order fulfillment rate, and supplier performance
                    </li>
                    <li>
                      <span className="font-medium">Recent Activity:</span> Shows recent orders, inventory changes, and
                      supplier updates
                    </li>
                    <li>
                      <span className="font-medium">Alerts:</span> Highlights items requiring attention, such as low
                      stock or delayed shipments
                    </li>
                    <li>
                      <span className="font-medium">Quick Actions:</span> Provides shortcuts to common tasks
                    </li>
                  </ul>

                  <h3 className="text-xl font-medium mt-6 mb-3">Customizing Your Dashboard</h3>
                  <p className="text-muted-foreground">
                    You can customize your dashboard to show the metrics and information most relevant to your role:
                  </p>
                  <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                    <li>Click the "Customize" button in the top-right corner of the dashboard</li>
                    <li>Drag and drop widgets to rearrange them</li>
                    <li>Add or remove widgets using the widget library</li>
                    <li>Save your custom layout</li>
                  </ol>
                </section>

                <div className="flex justify-between mt-8 pt-4 border-t">
                  <Button variant="outline" disabled>
                    Previous
                  </Button>
                  <Button asChild>
                    <Link href="#inventory">
                      Next <ChevronRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="examples" className="space-y-6">
                <h2 className="text-2xl font-bold mb-4">Example Scenarios</h2>
                <p className="text-muted-foreground mb-6">
                  These examples demonstrate how to use SupplyCycles for common supply chain management tasks.
                </p>

                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Example 1: Processing a New Order</CardTitle>
                      <CardDescription>How to create and process a new customer order</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                        <li>Navigate to the Orders section and click "New Order"</li>
                        <li>Select the customer from the dropdown or add a new customer</li>
                        <li>Add products to the order by searching the inventory</li>
                        <li>Specify quantities and any special instructions</li>
                        <li>Review the order details and submit</li>
                        <li>The system will automatically check inventory availability</li>
                        <li>Approve the order to initiate fulfillment</li>
                      </ol>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Example 2: Managing Low Stock</CardTitle>
                      <CardDescription>How to handle low stock alerts and reorder inventory</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                        <li>Review low stock alerts on your dashboard</li>
                        <li>Click on an alert to see detailed information</li>
                        <li>Check the product's historical demand and lead time</li>
                        <li>Navigate to the product details page</li>
                        <li>Click "Create Purchase Order" to reorder from the supplier</li>
                        <li>Specify the quantity based on the recommended amount</li>
                        <li>Submit the purchase order for approval</li>
                      </ol>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Example 3: Onboarding a New Supplier</CardTitle>
                      <CardDescription>How to add and set up a new supplier in the system</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                        <li>Go to the Suppliers section and click "Add Supplier"</li>
                        <li>Enter the supplier's contact information and details</li>
                        <li>Set up payment terms and delivery conditions</li>
                        <li>Add the products supplied by this vendor</li>
                        <li>Configure lead times and minimum order quantities</li>
                        <li>Set up quality control parameters</li>
                        <li>Invite the supplier to create their account for collaboration</li>
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

