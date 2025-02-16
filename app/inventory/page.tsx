// src/app/inventory/page.tsx
"use client"

import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { DataTable } from "@/components/table/DataTable";
import { Button } from "@/components/ui/button";
import { PlusIcon } from 'lucide-react';
import { RootState, AppDispatch } from "@/lib/store";
import { fetchInventory, resetLoading, setLoading } from "@/lib/slices/inventorySlice";
import { AddInventoryModal } from "@/components/inventory/AddInventoryModal";
import { useEffect } from "react";
import { InventoryItem } from "@/lib/types";
import { EditInventoryModal } from "@/components/inventory/EditInventoryModal";
import { DeleteModal } from "@/components/inventory/DeleteModal";
import { toast } from "@/hooks/use-toast";
import { ErrorState } from "@/components/ui/error";
import { useRouter } from "next/navigation";

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
    accessorKey: "minAmount",
    header: "Min. Amount",
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
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<InventoryItem | null>(null);
  const [lowStockItems, setLowStockItems] = useState<InventoryItem[]>([]);

  const router = useRouter()

  useEffect(() => {
    dispatch(setLoading(true))
    dispatch(fetchInventory())
      .unwrap()
      .then(() => {
        dispatch(setLoading(false))
      })
      .catch((error) => {
        console.error("Failed to fetch inventory:", error)
        dispatch(setLoading(false))
      })

    return () => {
      dispatch(resetLoading())
    }
  }, [dispatch])

  useEffect(() => {
    const updateLowStock = () => {
      if (inventory.items) {
        const lowStock = inventory.items.filter((item) => item.quantity <= item.minAmount)
        setLowStockItems(lowStock)
      }
    }
    updateLowStock()
  }, [inventory.items])

  useEffect(() => {
    if (lowStockItems.length > 0) {
      toast({
        title: "Low Stock Alert",
        description: `The following item(s) are low in stock: ${lowStockItems.map((item) => item.name).join(", ")}.`,
      })
    }
  }, [lowStockItems])

  const handleAddModalOpen = () => {
    setAddModalOpen(true)
  };
  const handleAddModalClose = () => {
    setAddModalOpen(false)
  };

  const handleEditModalOpen = (item: InventoryItem) => {
    setSelectedItem(item)
    setEditModalOpen(true)
  };
  const handleEditModalClose = () => {
    setSelectedItem(null);
    setEditModalOpen(false)
  };
  const handleOpenDeleteModal = (item: InventoryItem) => {
    setItemToDelete(item);
    setDeleteModalOpen(true)
  };
  const handleCloseDeleteModal = () => {
    setItemToDelete(null);
    setDeleteModalOpen(false)
  };

  const formattedInventory = inventory.items?.map(item => ({
    ...item,
    id: item.id.toString()
  })) || [];

  if (inventory.error) {
    return (
      <div className="flex h-full items-center justify-center bg-none">
        <ErrorState
          message={inventory.error}
          onRetry={() => {
            dispatch(setLoading(true))
            dispatch(fetchInventory())
          }}
          onCancel={() => router.push("/dashboard")}
        />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl sm:text-3xl font-bold">Inventory Management</h1>
        <Button onClick={handleAddModalOpen}>
          <PlusIcon className="mr-2 h-4 w-4" /> Add Item
        </Button>
      </div>
      <DataTable columns={columns} data={formattedInventory as any} onDelete={handleOpenDeleteModal} onEdit={handleEditModalOpen} />
      <AddInventoryModal open={addModalOpen} onClose={handleAddModalClose} />
      <EditInventoryModal open={editModalOpen} onClose={handleEditModalClose} data={selectedItem} />
      <DeleteModal open={deleteModalOpen} onClose={handleCloseDeleteModal} data={itemToDelete} deleteModalTitle={"Delete Inventory Item"} />
    </div>
  )
}