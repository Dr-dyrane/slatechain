"use client"

import { useState } from "react"
import { DataTable } from "@/components/DataTable"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PlusIcon, MessageSquare, FileText } from 'lucide-react'

const supplierColumns = [
  { accessorKey: "name", header: "Name" },
  { accessorKey: "category", header: "Category" },
  { accessorKey: "rating", header: "Rating" },
  { accessorKey: "status", header: "Status" },
]

const supplierData = [
  { id: 1, name: "Acme Corp", category: "Electronics", rating: 4.5, status: "Active" },
  { id: 2, name: "Beta Industries", category: "Textiles", rating: 3.8, status: "Active" },
  { id: 3, name: "Gamma Supplies", category: "Raw Materials", rating: 4.2, status: "Inactive" },
]

export default function SuppliersPage() {
  const [activeTab, setActiveTab] = useState("list")

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">Supplier Collaboration</h1>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="list">Supplier List</TabsTrigger>
          <TabsTrigger value="communication">Communication</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>
        <TabsContent value="list">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Suppliers</CardTitle>
                <Button>
                  <PlusIcon className="mr-2 h-4 w-4" /> Add Supplier
                </Button>
              </div>
              <CardDescription>Manage your supplier relationships</CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable columns={supplierColumns} data={supplierData} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="communication">
          <Card>
            <CardHeader>
              <CardTitle>Communication Center</CardTitle>
              <CardDescription>Manage conversations with suppliers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row items-center justify-center h-64 bg-muted rounded-md">
                <MessageSquare className="mb-2 sm:mr-2 h-8 w-8" />
                <span>Communication Center Placeholder</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <CardTitle>Document Management</CardTitle>
              <CardDescription>Upload and manage supplier documents</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row items-center justify-center h-64 bg-muted rounded-md">
                <FileText className="mb-2 sm:mr-2 h-8 w-8" />
                <span>Document Management Placeholder</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
