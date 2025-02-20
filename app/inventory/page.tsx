// src/app/inventory/page.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { DataTable } from "@/components/table/DataTable";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { RootState, AppDispatch } from "@/lib/store";
import { fetchInventory, setLoading, updateInventoryItem } from "@/lib/slices/inventorySlice";
import { AddInventoryModal } from "@/components/inventory/AddInventoryModal";
import { EditInventoryModal } from "@/components/inventory/EditInventoryModal";
import { DeleteModal } from "@/components/inventory/DeleteModal";
import { toast } from "@/hooks/use-toast";
import { ErrorState } from "@/components/ui/error";
import { useRouter } from "next/navigation";
import { InventoryItem } from "@/lib/types";
import DashboardCard from "@/components/dashboard/DashboardCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WarehouseManagement } from "./WarehouseManagement";
import { ManufacturingManagement } from "./ManufacturingManagement";

export const columns = [
  { accessorKey: "name", header: "Name" },
  { accessorKey: "sku", header: "SKU" },
  { accessorKey: "quantity", header: "Quantity" },
  { accessorKey: "minAmount", header: "Min. Amount" },
  { accessorKey: "location", header: "Location" },
];

export default function InventoryPage() {
  const inventory = useSelector((state: RootState) => state.inventory);
  const dispatch = useDispatch<AppDispatch>();
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<InventoryItem | null>(null);
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("stock")

  // Fetch inventory on mount
  useEffect(() => {
    dispatch(setLoading(true));
    dispatch(fetchInventory()).finally(() => dispatch(setLoading(false)));
  }, [dispatch]);

  // Compute inventory KPIs
  const totalStock = useMemo(
    () => inventory.items?.reduce((sum, item) => sum + item.quantity, 0) || 0,
    [inventory.items]
  );

  const lowStockItems = useMemo(
    () => inventory.items?.filter(item => item.quantity < item.minAmount) || [],
    [inventory.items]
  );

  const mostStockedItem = useMemo(
    () => inventory.items?.reduce((max, item) => (item.quantity > max.quantity ? item : max), inventory.items?.[0] || { name: "N/A", quantity: 0 }),
    [inventory.items]
  );

  // Show toast notification for low stock items
  useEffect(() => {
    if (lowStockItems.length > 0) {
      toast({
        title: "Low Stock Alert",
        description: `Low stock: ${lowStockItems.map(item => item.name).join(", ")}.`,
        action: (
          <Button
            variant="outline"
            onClick={() => handleUpdateItem(lowStockItems[0], 10)}
          >
            Restock 10
          </Button>
        ),
      });
    }
  }, [lowStockItems]);


  // Handle inventory update
  const handleUpdateItem = async (item: InventoryItem, replenishmentAmount: number | undefined) => {
    try {
      if (!replenishmentAmount || replenishmentAmount <= 0) {
        toast({ title: "Error", description: "Invalid replenishment amount", variant: "destructive" });
        return;
      }

      const updatedItem = { ...item, quantity: item.quantity + replenishmentAmount };

      // Optimistically update Redux before API call
      dispatch(updateInventoryItem(updatedItem));

      // Call API
      await dispatch(updateInventoryItem(updatedItem)).unwrap();

      toast({ title: "Success", description: `"${item.name}" updated successfully!` });
    } catch (error) {
      toast({ title: "Error", description: "Failed to update inventory item", variant: "destructive" });
    }
  };

  // Modals handlers
  const handleAddModalOpen = () => setAddModalOpen(true);
  const handleAddModalClose = () => setAddModalOpen(false);
  const handleEditModalOpen = (item: InventoryItem) => {
    setSelectedItem(item);
    setEditModalOpen(true);
  };
  const handleEditModalClose = () => {
    setSelectedItem(null);
    setEditModalOpen(false);
  };
  const handleOpenDeleteModal = (item: InventoryItem) => {
    setItemToDelete(item);
    setDeleteModalOpen(true);
  };
  const handleCloseDeleteModal = () => {
    setItemToDelete(null);
    setDeleteModalOpen(false);
  };

  // Ensure inventory data format is consistent
  const formattedInventory = inventory.items?.map(item => ({
    ...item,
    id: item.id.toString(),
  })) || [];

  if (inventory.error) {
    return (
      <div className="flex h-full items-center justify-center bg-none">
        <ErrorState
          message={inventory.error}
          onRetry={() => {
            dispatch(setLoading(true));
            dispatch(fetchInventory());
          }}
          onCancel={() => router.push("/dashboard")}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl sm:text-3xl font-bold">Inventory Management</h1>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <DashboardCard card={{ title: "Total Stock", value: totalStock.toString(), type: "number", icon: "Package", description: "Total items in stock", sparklineData: [totalStock] }} />
        <DashboardCard card={{ title: "Low Stock Items", value: lowStockItems.length.toString(), type: "number", icon: "Truck", description: "Items that need replenishment", sparklineData: [lowStockItems.length] }} />
        <DashboardCard card={{ title: "Most Stocked Item", value: mostStockedItem?.name || "N/A", type: "orders", icon: "Package", description: "Item with highest stock", sparklineData: [mostStockedItem?.quantity || 0] }} />
      </div>

      <Tabs defaultValue="stock" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full mb-8 flex flex-wrap justify-start">
          <TabsTrigger value="stock">Stock Overview</TabsTrigger>
          <TabsTrigger value="warehouse">Warehouse</TabsTrigger>
          <TabsTrigger value="manufacturing">Manufacturing</TabsTrigger>
        </TabsList>
        <TabsContent value="stock">
          <div className="flex justify-between items-center mb-4">
            <p className="text-muted-foreground">Real-time stock levels</p>
            <Button onClick={handleAddModalOpen}>
              <PlusIcon className="mr-2 h-4 w-4" /> Add Stock
            </Button>
          </div>
          {/* Inventory Table */}
          <DataTable
            columns={columns}
            data={formattedInventory as any}
            onDelete={handleOpenDeleteModal}
            onEdit={handleEditModalOpen}
          />
          <AddInventoryModal open={addModalOpen} onClose={handleAddModalClose} />
          <EditInventoryModal open={editModalOpen} onClose={handleEditModalClose} data={selectedItem} />
          <DeleteModal
            open={deleteModalOpen}
            onClose={handleCloseDeleteModal}
            data={itemToDelete}
            deleteModalTitle={"Delete Inventory Item"}
          />
        </TabsContent>
        <TabsContent value="warehouse">
          <WarehouseManagement />
        </TabsContent>
        <TabsContent value="manufacturing">
          <ManufacturingManagement />
        </TabsContent>
      </Tabs>


    </div>
  );
}
