// src/app/inventory/page.tsx
"use client"

import { useSelector } from "react-redux"
import { DataTable } from "@/components/DataTable"
import { Button } from "@/components/ui/button"
import { PlusIcon } from 'lucide-react'
import { RootState } from "@/lib/store"

export const columns = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "sku",
    header: "SKU",
  },
  {
    accessorKey: "quantity",
    header: "Quantity",
  },
  {
    accessorKey: "location",
    header: "Location",
  },
]

export default function InventoryPage() {
  const inventory = useSelector((state: RootState) => state.inventory.items)

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Inventory Management</h1>
        <Button>
          <PlusIcon className="mr-2 h-4 w-4" /> Add Item
        </Button>
      </div>
      <DataTable columns={columns} data={inventory} />
    </div>
  )
}