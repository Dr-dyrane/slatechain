"use client"

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { FileText, Download } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { exportToCSV } from "@/lib/utils"
import { useSelector } from "react-redux"
import type { RootState } from "@/lib/store"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { format } from "date-fns"

export function ReportModal() {
  const inventory = useSelector((state: RootState) => state.inventory)
  const [open, setOpen] = React.useState(false)

  // Define column mappings for each report type
  const inventoryColumns = [
    { accessorKey: "id", header: "ID" },
    { accessorKey: "name", header: "Name" },
    { accessorKey: "sku", header: "SKU" },
    { accessorKey: "quantity", header: "Quantity" },
    { accessorKey: "minAmount", header: "Min. Amount" },
    { accessorKey: "location", header: "Location" },
  ]

  const warehouseColumns = [
    { accessorKey: "id", header: "ID" },
    { accessorKey: "name", header: "Name" },
    { accessorKey: "location", header: "Location" },
    { accessorKey: "capacity", header: "Capacity" },
    { accessorKey: "utilizationPercentage", header: "Utilization %" },
    { accessorKey: "status", header: "Status" },
  ]

  const manufacturingColumns = [
    { accessorKey: "id", header: "ID" },
    { accessorKey: "orderNumber", header: "Order #" },
    { accessorKey: "name", header: "Name" },
    { accessorKey: "inventoryItemId", header: "Product ID" },
    { accessorKey: "quantity", header: "Quantity" },
    { accessorKey: "status", header: "Status" },
  ]

  // Generate report filename with current date
  const getReportFilename = (reportType: string) => {
    const date = format(new Date(), "yyyy-MM-dd")
    return `${reportType}-report-${date}.csv`
  }

  // Export handlers for each report type
  const handleExportInventory = () => {
    exportToCSV(inventory.items || [], inventoryColumns, getReportFilename("inventory"))
  }

  const handleExportWarehouses = () => {
    exportToCSV(inventory.warehouses || [], warehouseColumns, getReportFilename("warehouse"))
  }

  const handleExportManufacturing = () => {
    exportToCSV(inventory.manufacturingOrders || [], manufacturingColumns, getReportFilename("manufacturing"))
  }

  const handleExportAll = () => {
    // Export all reports in sequence
    handleExportInventory()
    setTimeout(handleExportWarehouses, 500)
    setTimeout(handleExportManufacturing, 1000)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <FileText className="mr-2 h-4 w-4" />
          Reports
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Inventory Reports</DialogTitle>
          <DialogDescription>Generate and download reports for your inventory system.</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="inventory" className="mt-4">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
            <TabsTrigger value="warehouse">Warehouse</TabsTrigger>
            <TabsTrigger value="manufacturing">Manufacturing</TabsTrigger>
          </TabsList>

          <TabsContent value="inventory">
            <Card>
              <CardHeader>
                <CardTitle>Inventory Report</CardTitle>
                <CardDescription>Export all inventory items with their current stock levels.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  <p>This report includes:</p>
                  <ul className="list-disc pl-5 mt-2 space-y-1">
                    <li>Item names and SKUs</li>
                    <li>Current quantities</li>
                    <li>Minimum stock levels</li>
                    <li>Storage locations</li>
                  </ul>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleExportInventory} className="ml-auto">
                  <Download className="mr-2 h-4 w-4" />
                  Export Inventory
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="warehouse">
            <Card>
              <CardHeader>
                <CardTitle>Warehouse Report</CardTitle>
                <CardDescription>Export all warehouse data and utilization metrics.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  <p>This report includes:</p>
                  <ul className="list-disc pl-5 mt-2 space-y-1">
                    <li>Warehouse names and locations</li>
                    <li>Storage capacity</li>
                    <li>Current utilization percentages</li>
                    <li>Operational status</li>
                  </ul>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleExportWarehouses} className="ml-auto">
                  <Download className="mr-2 h-4 w-4" />
                  Export Warehouses
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="manufacturing">
            <Card>
              <CardHeader>
                <CardTitle>Manufacturing Report</CardTitle>
                <CardDescription>Export all manufacturing orders and their status.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  <p>This report includes:</p>
                  <ul className="list-disc pl-5 mt-2 space-y-1">
                    <li>Order numbers and names</li>
                    <li>Product references</li>
                    <li>Production quantities</li>
                    <li>Current status</li>
                  </ul>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleExportManufacturing} className="ml-auto">
                  <Download className="mr-2 h-4 w-4" />
                  Export Manufacturing
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-between mt-6">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleExportAll}>
            <Download className="mr-2 h-4 w-4" />
            Export All Reports
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

