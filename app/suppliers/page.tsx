// src/app/suppliers/page.tsx
"use client"

import { useState, useEffect } from "react"
import { useSelector, useDispatch } from "react-redux"
import { DataTable } from "@/components/table/DataTable"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PlusIcon, MessageSquare, FileText } from 'lucide-react'
import { RootState, AppDispatch } from "@/lib/store";
import {  fetchSuppliers } from "@/lib/slices/supplierSlice";
import { Supplier } from "@/lib/types";
import { AddSupplierModal } from "@/components/supplier/AddSupplierModal";

const supplierColumns = [
  { accessorKey: "name", header: "Name" },
   { accessorKey: "contactPerson", header: "Contact Person" },
  { accessorKey: "rating", header: "Rating" },
  { accessorKey: "status", header: "Status" },
]


export default function SuppliersPage() {
  const [activeTab, setActiveTab] = useState("list")
    const dispatch = useDispatch<AppDispatch>();
      const suppliers = useSelector((state: RootState) => state.supplier.items);
     const [addModalOpen, setAddModalOpen] = useState(false);


    useEffect(() => {
        dispatch(fetchSuppliers());
    }, [dispatch]);

  const handleAddModalOpen = () => {
         setAddModalOpen(true)
    }
     const handleAddModalClose = () => {
        setAddModalOpen(false)
    };
    const formattedSuppliers = suppliers?.map(supplier => ({
         ...supplier,
         id: supplier.id?.toString()
    })) || [];
  return (
    <div className="space-y-4">
      <h1 className="text-2xl sm:text-3xl font-bold">Supplier Collaboration</h1>
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
                  <Button onClick={handleAddModalOpen}>
                    <PlusIcon className="mr-2 h-4 w-4" /> Add Supplier
                  </Button>
               </div>
               <CardDescription>Manage your supplier relationships</CardDescription>
            </CardHeader>
            <CardContent>
                 <DataTable columns={supplierColumns} data={formattedSuppliers as any} />
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
      <AddSupplierModal open={addModalOpen} onClose={handleAddModalClose} />
    </div>
  )
}