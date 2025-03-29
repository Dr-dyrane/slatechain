"use client"

import type React from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, Smartphone, Search, ChevronRight, DownloadCloud } from "lucide-react"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useState } from "react"
import Image from "next/image"

export default function MobileAppGuidePage() {
  const [searchQuery, setSearchQuery] = useState("")

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/settings/help-support">
            <ChevronLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h1 className="text-2xl sm:text-3xl font-bold">Mobile App Guide</h1>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search in mobile app guide..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="md:col-span-1 h-fit">
          <CardHeader>
            <CardTitle className="text-lg flex items-center space-x-2">
              <Smartphone className="h-5 w-5" />
              <span>Contents</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[calc(100vh-300px)]">
              <div className="space-y-1">
                <TableOfContentsItem href="#introduction" label="Introduction" />
                <TableOfContentsItem href="#getting-started" label="Getting Started" isExpanded>
                  <TableOfContentsItem href="#installation" label="Installation" level={2} />
                  <TableOfContentsItem href="#login" label="Login & Authentication" level={2} />
                  <TableOfContentsItem href="#navigation" label="Navigation" level={2} />
                </TableOfContentsItem>
                <TableOfContentsItem href="#key-features" label="Key Features" isExpanded>
                  <TableOfContentsItem href="#dashboard" label="Mobile Dashboard" level={2} />
                  <TableOfContentsItem href="#orders" label="Order Management" level={2} />
                  <TableOfContentsItem href="#inventory" label="Inventory Tracking" level={2} />
                </TableOfContentsItem>
                <TableOfContentsItem href="#notifications" label="Notifications" />
                <TableOfContentsItem href="#offline" label="Offline Mode" />
                <TableOfContentsItem href="#settings" label="App Settings" />
                <TableOfContentsItem href="#troubleshooting" label="Troubleshooting" />
                <TableOfContentsItem href="#updates" label="Updates & Versions" />
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        <Card className="md:col-span-3">
          <CardContent className="p-6">
            <Tabs defaultValue="content" className="w-full">
              <TabsList className="grid grid-cols-2 mb-6">
                <TabsTrigger value="content">Content</TabsTrigger>
                <TabsTrigger value="screenshots">Screenshots</TabsTrigger>
              </TabsList>

              <TabsContent value="content" className="space-y-8">
                <section id="introduction" className="scroll-mt-16">
                  <h2 className="text-2xl font-bold mb-4">Introduction to the SlateChain Mobile App</h2>
                  <p className="text-muted-foreground mb-4">
                    The SlateChain mobile app brings the power of our supply chain management platform to your mobile
                    device. Whether you're on the warehouse floor, visiting suppliers, or working remotely, the mobile
                    app keeps you connected to your supply chain operations.
                  </p>
                  <p className="text-muted-foreground mb-4">
                    Available for both iOS and Android devices, the SlateChain mobile app provides a streamlined
                    interface optimized for on-the-go access to critical supply chain information and functions.
                  </p>
                  <div className="bg-muted p-4 rounded-lg">
                    <h3 className="font-medium mb-2">Key Benefits</h3>
                    <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                      <li>Access your supply chain data anytime, anywhere</li>
                      <li>Receive real-time notifications for critical events</li>
                      <li>Approve orders and requests on the go</li>
                      <li>Scan barcodes and QR codes for quick inventory updates</li>
                      <li>Capture and upload photos directly to the system</li>
                      <li>Work offline when network connectivity is limited</li>
                    </ul>
                  </div>
                </section>

                <section id="getting-started" className="scroll-mt-16">
                  <h2 className="text-2xl font-bold mb-4">Getting Started</h2>

                  <h3 id="installation" className="text-xl font-medium mt-6 mb-3 scroll-mt-16">
                    Installation
                  </h3>
                  <p className="text-muted-foreground mb-4">To install the SlateChain mobile app:</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-start space-x-4">
                          <DownloadCloud className="h-8 w-8 text-primary mt-1" />
                          <div>
                            <h3 className="font-medium mb-2">iOS Installation</h3>
                            <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                              <li>Open the App Store on your iOS device</li>
                              <li>Search for "SlateChain"</li>
                              <li>Tap "Get" or the download icon</li>
                              <li>Authenticate with Face ID, Touch ID, or your Apple ID password</li>
                              <li>Wait for the app to download and install</li>
                            </ol>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-start space-x-4">
                          <DownloadCloud className="h-8 w-8 text-primary mt-1" />
                          <div>
                            <h3 className="font-medium mb-2">Android Installation</h3>
                            <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                              <li>Open the Google Play Store on your Android device</li>
                              <li>Search for "SlateChain"</li>
                              <li>Tap "Install"</li>
                              <li>Review and accept the permissions</li>
                              <li>Wait for the app to download and install</li>
                            </ol>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <h3 id="login" className="text-xl font-medium mt-6 mb-3 scroll-mt-16">
                    Login & Authentication
                  </h3>
                  <p className="text-muted-foreground mb-4">To log in to the SlateChain mobile app:</p>
                  <ol className="list-decimal list-inside space-y-2 text-muted-foreground mb-4">
                    <li>Launch the SlateChain app on your device</li>
                    <li>Enter your SlateChain email address and password</li>
                    <li>Alternatively, use biometric authentication if enabled (Face ID, Touch ID, or fingerprint)</li>
                    <li>You can also use "Sign in with Google" or "Sign in with Apple" if your account is linked</li>
                    <li>For enhanced security, you may be prompted for two-factor authentication</li>
                  </ol>

                  <div className="bg-muted p-4 rounded-lg mb-6">
                    <h4 className="font-medium mb-2">Blockchain Authentication</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      If you use blockchain authentication on the web platform, you can also use it on mobile:
                    </p>
                    <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                      <li>Tap "Sign in with Blockchain"</li>
                      <li>Select your preferred wallet app</li>
                      <li>Approve the connection request in your wallet</li>
                      <li>Sign the authentication message</li>
                    </ol>
                  </div>

                  <h3 id="navigation" className="text-xl font-medium mt-6 mb-3 scroll-mt-16">
                    Navigation
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    The SlateChain mobile app uses a tab-based navigation system for easy access to key features:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li>
                      <span className="font-medium">Dashboard:</span> Overview of key metrics and recent activity
                    </li>
                    <li>
                      <span className="font-medium">Orders:</span> View and manage purchase orders
                    </li>
                    <li>
                      <span className="font-medium">Inventory:</span> Track and update inventory levels
                    </li>
                    <li>
                      <span className="font-medium">Scan:</span> Scan barcodes and QR codes
                    </li>
                    <li>
                      <span className="font-medium">More:</span> Access additional features like documents, settings,
                      and help
                    </li>
                  </ul>
                </section>

                <section id="key-features" className="scroll-mt-16">
                  <h2 className="text-2xl font-bold mb-4">Key Features</h2>

                  <h3 id="dashboard" className="text-xl font-medium mt-6 mb-3 scroll-mt-16">
                    Mobile Dashboard
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    The mobile dashboard provides a quick overview of your supply chain operations:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
                    <li>
                      <span className="font-medium">KPI Cards:</span> View key performance indicators in a
                      mobile-friendly format
                    </li>
                    <li>
                      <span className="font-medium">Recent Activity:</span> See the latest orders, inventory changes,
                      and notifications
                    </li>
                    <li>
                      <span className="font-medium">Quick Actions:</span> Access frequently used functions with one tap
                    </li>
                    <li>
                      <span className="font-medium">Alerts:</span> View critical issues requiring attention
                    </li>
                  </ul>

                  <h3 id="orders" className="text-xl font-medium mt-6 mb-3 scroll-mt-16">
                    Order Management
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Manage orders on the go with these mobile-optimized features:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
                    <li>
                      <span className="font-medium">Order List:</span> View all orders with filtering options
                    </li>
                    <li>
                      <span className="font-medium">Order Details:</span> Access complete order information
                    </li>
                    <li>
                      <span className="font-medium">Order Approval:</span> Approve or reject orders directly from your
                      device
                    </li>
                    <li>
                      <span className="font-medium">Status Updates:</span> Update order status as it progresses
                    </li>
                    <li>
                      <span className="font-medium">Photo Capture:</span> Take photos of shipments or issues and attach
                      them to orders
                    </li>
                  </ul>

                  <h3 id="inventory" className="text-xl font-medium mt-6 mb-3 scroll-mt-16">
                    Inventory Tracking
                  </h3>
                  <p className="text-muted-foreground">Keep track of inventory levels and update stock information:</p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li>
                      <span className="font-medium">Inventory Search:</span> Quickly find products in your inventory
                    </li>
                    <li>
                      <span className="font-medium">Barcode Scanning:</span> Scan product barcodes to view or update
                      inventory
                    </li>
                    <li>
                      <span className="font-medium">Stock Adjustments:</span> Record inventory additions, removals, or
                      transfers
                    </li>
                    <li>
                      <span className="font-medium">Low Stock Alerts:</span> View items with low inventory levels
                    </li>
                    <li>
                      <span className="font-medium">Batch Processing:</span> Update multiple items at once
                    </li>
                  </ul>
                </section>

                <div className="flex justify-between mt-8 pt-4 border-t">
                  <Button variant="outline" disabled>
                    Previous
                  </Button>
                  <Button asChild>
                    <Link href="#notifications">
                      Next <ChevronRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="screenshots" className="space-y-6">
                <h2 className="text-2xl font-bold mb-4">Mobile App Screenshots</h2>
                <p className="text-muted-foreground mb-6">
                  These screenshots demonstrate key features of the SlateChain mobile app.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <div className="relative h-80 w-full">
                      <Image
                        src="/placeholder.svg?height=400&width=200"
                        alt="Mobile Dashboard"
                        fill
                        className="object-contain"
                      />
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-medium">Mobile Dashboard</h3>
                      <p className="text-sm text-muted-foreground">
                        The dashboard provides a quick overview of key metrics and recent activity.
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <div className="relative h-80 w-full">
                      <Image
                        src="/placeholder.svg?height=400&width=200"
                        alt="Order Management"
                        fill
                        className="object-contain"
                      />
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-medium">Order Management</h3>
                      <p className="text-sm text-muted-foreground">
                        View and manage orders with detailed information and status updates.
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <div className="relative h-80 w-full">
                      <Image
                        src="/placeholder.svg?height=400&width=200"
                        alt="Inventory Scanning"
                        fill
                        className="object-contain"
                      />
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-medium">Inventory Scanning</h3>
                      <p className="text-sm text-muted-foreground">
                        Scan barcodes to quickly update inventory levels and track products.
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <div className="relative h-80 w-full">
                      <Image
                        src="/placeholder.svg?height=400&width=200"
                        alt="Notifications"
                        fill
                        className="object-contain"
                      />
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-medium">Notifications</h3>
                      <p className="text-sm text-muted-foreground">
                        Receive real-time alerts and updates about your supply chain operations.
                      </p>
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

