// src/app/inventory/page.tsx
"use client"

import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { DataTable } from "@/components/table/DataTable";
import { Button } from "@/components/ui/button";
import { PlusIcon } from 'lucide-react';
import { RootState, AppDispatch } from "@/lib/store";
import { fetchInventory } from "@/lib/slices/inventorySlice";
import { AddInventoryModal } from "@/components/inventory/AddInventoryModal";
import { useEffect } from "react";

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
];

export default function InventoryPage() {
  const inventory = useSelector((state: RootState) => state.inventory);
  const dispatch = useDispatch<AppDispatch>();
  const [addModalOpen, setAddModalOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchInventory());
  }, [dispatch])

  const handleAddModalOpen = () => {
    setAddModalOpen(true)
  };
  const handleAddModalClose = () => {
    setAddModalOpen(false)
  };


  const formattedInventory = inventory.items?.map(item => ({
    ...item,
    id: item.id.toString()
  })) || [];
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Inventory Management</h1>
        <Button onClick={handleAddModalOpen}>
          <PlusIcon className="mr-2 h-4 w-4" /> Add Item
        </Button>
      </div>
      <DataTable columns={columns} data={formattedInventory as any} />
      <AddInventoryModal open={addModalOpen} onClose={handleAddModalClose} />
    </div>
  );
}