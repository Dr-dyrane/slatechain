"use client"

import type React from "react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, BarChart3, TrendingUp, AlertTriangle, CheckCircle, Package } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function InventoryOptimizationGuidePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/settings/help-support">
            <ChevronLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h1 className="text-2xl sm:text-3xl font-bold">Inventory Optimization Guide</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center space-x-2">
            <BarChart3 className="h-5 w-5" />
            <span>Optimizing Your Inventory in SlateChain</span>
          </CardTitle>
          <CardDescription>
            Learn strategies and techniques to optimize your inventory levels and reduce costs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid grid-cols-4 mb-8">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="analysis">Analysis Tools</TabsTrigger>
              <TabsTrigger value="strategies">Strategies</TabsTrigger>
              <TabsTrigger value="automation">Automation</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="relative w-full h-64 rounded-lg overflow-hidden">
                <Image
                  src="/placeholder.svg?height=400&width=800"
                  alt="Inventory Optimization Overview"
                  fill
                  className="object-cover"
                />
              </div>

              <h2 className="text-2xl font-semibold mt-6">Inventory Optimization Overview</h2>
              <p className="text-muted-foreground">
                Inventory optimization is the process of maintaining the right amount of inventory to meet customer
                demand while minimizing costs. SlateChain provides powerful tools and insights to help you optimize your
                inventory levels across your supply chain.
              </p>

              <h3 className="text-xl font-medium mt-6">Key Benefits of Inventory Optimization</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
                <BenefitCard
                  icon={<TrendingUp className="h-8 w-8" />}
                  title="Reduced Carrying Costs"
                  description="Lower the costs associated with storing and maintaining inventory by keeping optimal stock levels."
                />
                <BenefitCard
                  icon={<AlertTriangle className="h-8 w-8" />}
                  title="Minimized Stockouts"
                  description="Prevent lost sales and customer dissatisfaction by maintaining adequate inventory levels."
                />
                <BenefitCard
                  icon={<Package className="h-8 w-8" />}
                  title="Improved Cash Flow"
                  description="Free up capital by reducing excess inventory and investing only in what you need."
                />
              </div>

              <div className="bg-muted p-6 rounded-lg mt-8">
                <h3 className="font-semibold text-lg mb-3">Getting Started with Inventory Optimization</h3>
                <p className="text-muted-foreground mb-4">
                  To begin optimizing your inventory in SlateChain, follow these steps:
                </p>
                <ol className="space-y-2 text-muted-foreground">
                  <li className="flex items-start space-x-2">
                    <span className="font-medium">1.</span>
                    <span>Review your current inventory levels and historical data</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="font-medium">2.</span>
                    <span>Identify high-value and high-turnover items that should be prioritized</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="font-medium">3.</span>
                    <span>Set up inventory categories and classification (A, B, C items)</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="font-medium">4.</span>
                    <span>Configure reorder points and safety stock levels</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="font-medium">5.</span>
                    <span>Implement automated reordering for key items</span>
                  </li>
                </ol>
              </div>
            </TabsContent>

            <TabsContent value="analysis" className="space-y-6">
              <h2 className="text-2xl font-semibold">Inventory Analysis Tools</h2>
              <p className="text-muted-foreground mb-6">
                SlateChain provides several powerful analysis tools to help you understand your inventory performance
                and identify optimization opportunities.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <AnalysisToolCard
                  title="ABC Analysis"
                  description="Categorize inventory items based on their value and importance to focus optimization efforts."
                  image="/placeholder.svg?height=300&width=600"
                />

                <AnalysisToolCard
                  title="Inventory Turnover Analysis"
                  description="Measure how quickly inventory is sold and replaced to identify slow-moving items."
                  image="/placeholder.svg?height=300&width=600"
                />

                <AnalysisToolCard
                  title="Demand Forecasting"
                  description="Predict future demand based on historical data and market trends to optimize stock levels."
                  image="/placeholder.svg?height=300&width=600"
                />

                <AnalysisToolCard
                  title="Stock Level Reports"
                  description="View detailed reports on current stock levels, reorder points, and safety stock across locations."
                  image="/placeholder.svg?height=300&width=600"
                />
              </div>

              <h3 className="text-xl font-medium mt-8">Using the Analysis Dashboard</h3>
              <p className="text-muted-foreground mb-4">
                The Inventory Analysis Dashboard provides a comprehensive view of your inventory performance with key
                metrics and visualizations.
              </p>

              <div className="relative w-full h-64 rounded-lg overflow-hidden mb-6">
                <Image
                  src="/placeholder.svg?height=400&width=800"
                  alt="Inventory Analysis Dashboard"
                  fill
                  className="object-cover"
                />
              </div>

              <div className="space-y-4">
                <FeatureItem
                  title="Key Performance Indicators"
                  description="Monitor essential metrics like inventory turnover ratio, days of supply, and carrying costs."
                />
                <FeatureItem
                  title="Trend Analysis"
                  description="View historical trends in inventory levels and demand to identify patterns and seasonality."
                />
                <FeatureItem
                  title="Exception Reports"
                  description="Quickly identify items that are overstocked, understocked, or approaching expiration."
                />
                <FeatureItem
                  title="Custom Reports"
                  description="Create and save custom reports tailored to your specific business needs and KPIs."
                />
              </div>
            </TabsContent>

            <TabsContent value="strategies" className="space-y-6">
              <h2 className="text-2xl font-semibold">Inventory Optimization Strategies</h2>
              <p className="text-muted-foreground mb-6">
                Implement these proven strategies in SlateChain to optimize your inventory and improve your supply chain
                efficiency.
              </p>

              <div className="space-y-8">
                <StrategyCard
                  number={1}
                  title="Just-in-Time (JIT) Inventory"
                  description="Minimize inventory levels by scheduling deliveries to arrive just when needed. SlateChain's integration with supplier systems and logistics tracking makes JIT implementation more feasible."
                  steps={[
                    "Identify items suitable for JIT approach",
                    "Configure lead time tracking for accurate delivery predictions",
                    "Set up automated purchase orders based on production schedules",
                    "Monitor and adjust based on performance metrics",
                  ]}
                />

                <StrategyCard
                  number={2}
                  title="Economic Order Quantity (EOQ)"
                  description="Calculate the optimal order quantity that minimizes total inventory costs, including ordering costs and carrying costs."
                  steps={[
                    "Enter cost parameters for ordering and holding inventory",
                    "Use SlateChain's EOQ calculator to determine optimal order quantities",
                    "Set up automated reordering based on EOQ calculations",
                    "Review and adjust parameters periodically",
                  ]}
                />

                <StrategyCard
                  number={3}
                  title="Safety Stock Optimization"
                  description="Maintain buffer inventory to protect against uncertainties in supply and demand while minimizing excess stock."
                  steps={[
                    "Analyze historical demand variability and lead time reliability",
                    "Set appropriate safety stock levels based on service level targets",
                    "Configure automatic adjustments based on seasonality",
                    "Monitor stockout incidents and adjust as needed",
                  ]}
                />

                <StrategyCard
                  number={4}
                  title="Vendor-Managed Inventory (VMI)"
                  description="Allow trusted suppliers to manage inventory levels of their products in your facilities, reducing your management burden."
                  steps={[
                    "Identify suitable suppliers for VMI relationships",
                    "Set up supplier access to inventory data through SlateChain",
                    "Establish performance metrics and service level agreements",
                    "Review supplier performance regularly",
                  ]}
                />
              </div>

              <div className="bg-muted p-6 rounded-lg mt-6">
                <h3 className="font-semibold mb-2">Strategy Selection Guide</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Different strategies work best for different types of inventory. Use this guide to select the most
                  appropriate strategy:
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>
                    <span className="font-medium">High-value, low-volume items:</span> JIT or VMI
                  </li>
                  <li>
                    <span className="font-medium">Medium-value, medium-volume items:</span> EOQ with moderate safety
                    stock
                  </li>
                  <li>
                    <span className="font-medium">Low-value, high-volume items:</span> Bulk ordering with automated
                    reordering
                  </li>
                  <li>
                    <span className="font-medium">Seasonal items:</span> Dynamic safety stock with demand forecasting
                  </li>
                </ul>
              </div>
            </TabsContent>

            <TabsContent value="automation" className="space-y-6">
              <h2 className="text-2xl font-semibold">Inventory Automation</h2>
              <p className="text-muted-foreground mb-6">
                Leverage SlateChain's automation capabilities to streamline inventory management and reduce manual
                effort.
              </p>

              <div className="relative w-full h-64 rounded-lg overflow-hidden mb-6">
                <Image
                  src="/placeholder.svg?height=400&width=800"
                  alt="Inventory Automation"
                  fill
                  className="object-cover"
                />
              </div>

              <h3 className="text-xl font-medium">Automation Features</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                <AutomationCard
                  title="Automated Reordering"
                  description="Set up automatic purchase orders when inventory reaches reorder points to maintain optimal stock levels without manual intervention."
                  setup={[
                    "Navigate to Inventory > Automation",
                    "Select 'Reorder Rules'",
                    "Configure reorder points and quantities",
                    "Select suppliers and approval workflows",
                  ]}
                />

                <AutomationCard
                  title="Low Stock Alerts"
                  description="Receive notifications when inventory levels fall below specified thresholds to prevent stockouts."
                  setup={[
                    "Go to Notifications > Inventory Alerts",
                    "Set threshold levels for different products",
                    "Configure notification methods (email, SMS, in-app)",
                    "Assign alert recipients",
                  ]}
                />

                <AutomationCard
                  title="Expiration Tracking"
                  description="Automatically track expiration dates for perishable items and receive alerts before products expire."
                  setup={[
                    "Enable expiration tracking in Inventory Settings",
                    "Set lead time for expiration notifications",
                    "Configure FIFO/FEFO inventory rules",
                    "Set up automated markdown schedules for aging inventory",
                  ]}
                />

                <AutomationCard
                  title="Inventory Reconciliation"
                  description="Schedule automatic inventory counts and reconciliation to maintain accurate inventory records."
                  setup={[
                    "Go to Inventory > Reconciliation",
                    "Set reconciliation frequency",
                    "Configure variance thresholds for alerts",
                    "Assign reconciliation tasks to team members",
                  ]}
                />
              </div>

              <h3 className="text-xl font-medium mt-8">Integration with Other Systems</h3>
              <p className="text-muted-foreground mb-4">
                SlateChain can integrate with other systems to automate inventory management across your entire
                operation.
              </p>

              <div className="space-y-4">
                <FeatureItem
                  title="ERP Integration"
                  description="Sync inventory data with your ERP system to maintain a single source of truth for inventory information."
                />
                <FeatureItem
                  title="E-commerce Integration"
                  description="Automatically update inventory levels across online sales channels to prevent overselling."
                />
                <FeatureItem
                  title="Warehouse Management Systems"
                  description="Connect with WMS to automate picking, packing, and putaway processes based on inventory optimization rules."
                />
                <FeatureItem
                  title="IoT and RFID"
                  description="Integrate with IoT devices and RFID systems for real-time inventory tracking and automated data collection."
                />
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-between mt-8">
            <Button variant="outline" asChild>
              <Link href="/settings/help-support">Back to Help Center</Link>
            </Button>
            <Button asChild>
              <Link href="/inventory">Go to Inventory</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

interface BenefitCardProps {
  icon: React.ReactNode
  title: string
  description: string
}

function BenefitCard({ icon, title, description }: BenefitCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="p-3 rounded-full bg-primary/10 text-primary">{icon}</div>
          <h3 className="font-semibold">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </CardContent>
    </Card>
  )
}

interface AnalysisToolCardProps {
  title: string
  description: string
  image: string
}

function AnalysisToolCard({ title, description, image }: AnalysisToolCardProps) {
  return (
    <Card className="overflow-hidden">
      <div className="relative h-40">
        <Image src={image || "/placeholder.svg"} alt={title} fill className="object-cover" />
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )
}

interface StrategyCardProps {
  number: number
  title: string
  description: string
  steps: string[]
}

function StrategyCard({ number, title, description, steps }: StrategyCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold shrink-0">
            {number}
          </div>
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">{title}</h3>
            <p className="text-muted-foreground">{description}</p>
            <div className="space-y-2 mt-4">
              <h4 className="font-medium">Implementation Steps:</h4>
              <ul className="space-y-1">
                {steps.map((step, index) => (
                  <li key={index} className="flex items-start space-x-2 text-sm text-muted-foreground">
                    <CheckCircle className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface AutomationCardProps {
  title: string
  description: string
  setup: string[]
}

function AutomationCard({ title, description, setup }: AutomationCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground mt-2 mb-4">{description}</p>
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Setup Instructions:</h4>
          <ol className="space-y-1">
            {setup.map((step, index) => (
              <li key={index} className="flex items-start space-x-2 text-sm text-muted-foreground">
                <span className="font-medium">{index + 1}.</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>
      </CardContent>
    </Card>
  )
}

interface FeatureItemProps {
  title: string
  description: string
}

function FeatureItem({ title, description }: FeatureItemProps) {
  return (
    <div className="flex items-start space-x-3">
      <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
      <div>
        <h3 className="font-medium">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  )
}

