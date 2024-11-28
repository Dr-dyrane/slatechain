"use client"

import { useEffect } from "react"
import { useSelector, useDispatch } from "react-redux"
import { DataTable } from "@/components/DataTable"
import { Button } from "@/components/ui/button"
import { PlusIcon } from 'lucide-react'
import { RootState } from "@/lib/store"
import { setInventory } from "@/lib/slices/inventorySlice"

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
  const dispatch = useDispatch()

  useEffect(() => {
    // Simulated API call
    const fetchInventory = async () => {
      // In a real application, this would be an API call
      const data = [
        { id: 1, name: "Product A", sku: "SKU001", quantity: 100, location: "Warehouse 1" },
        { id: 2, name: "Product B", sku: "SKU002", quantity: 150, location: "Warehouse 2" },
        { id: 3, name: "Product C", sku: "SKU003", quantity: 75, location: "Warehouse 1" },
      ]
      dispatch(setInventory(data))
    }

    fetchInventory()
  }, [dispatch])

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
