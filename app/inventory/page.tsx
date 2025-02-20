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
import { fetchWarehouses, fetchManufacturingOrders } from "@/lib/slices/inventorySlice";
import { CardData } from "@/components/supplier/SupplierKPIs";

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

    useEffect(() => {
        dispatch(setLoading(true));
        Promise.all([dispatch(fetchInventory()), dispatch(fetchWarehouses()), dispatch(fetchManufacturingOrders())])
            .finally(() => dispatch(setLoading(false)));
    }, [dispatch]);

    // Memoized KPI cards based on active tab
    const kpiCards = useMemo(() => {
        switch (activeTab) {
            case "stock":
                return [
                    { title: "Total Stock", value: (inventory.items?.reduce((sum, item) => sum + item.quantity, 0) || 0).toString(), type: "number", icon: "Package2", description: "Total items in stock", sparklineData: [inventory.items?.reduce((sum, item) => sum + item.quantity, 0) || 0] },
                    { title: "Low Stock Items", value: (inventory.items?.filter(item => item.quantity < item.minAmount) || []).length.toString(), type: "number", icon: "Truck", description: "Items that need replenishment", sparklineData: [(inventory.items?.filter(item => item.quantity < item.minAmount) || []).length] },
                    { title: "Most Stocked Item", value: inventory.items?.reduce((max, item) => (item.quantity > max.quantity ? item : max), inventory.items?.[0] || { name: "N/A", quantity: 0 }).name || "N/A", type: "orders", icon: "Package", description: "Item with highest stock", sparklineData: [inventory.items?.reduce((max, item) => (item.quantity > max.quantity ? item : max), inventory.items?.[0] || { name: "N/A", quantity: 0 }).quantity || 0] }
                ];
            case "warehouse":
                return [
                    { title: "Total Warehouses", value: inventory.warehouses?.length.toString(), type: "number", icon: "Building", description: "Total number of warehouses", sparklineData: [inventory.warehouses?.length || 0] },
                    { title: "Average Utilization", value: inventory.warehouses?.reduce((sum, wh) => sum + wh.utilizationPercentage, 0).toString(), type: "number", icon: "BarChart", description: "Average warehouse utilization", sparklineData: [inventory.warehouses?.reduce((sum, wh) => sum + wh.utilizationPercentage, 0) || 0] },
                    { title: "Active Warehouses", value: (inventory.warehouses?.filter(wh => wh.status === "ACTIVE") || []).length.toString(), type: "number", icon: "CheckCircle", description: "Number of active warehouses", sparklineData: [(inventory.warehouses?.filter(wh => wh.status === "ACTIVE") || []).length] }
                ];
            case "manufacturing":
                return [
                    { title: "Total Manufacturing Orders", value: inventory.manufacturingOrders?.length.toString(), type: "number", icon: "Factory", description: "Total manufacturing orders", sparklineData: [inventory.manufacturingOrders?.length || 0] },
                    { title: "Orders Completed", value: (inventory.manufacturingOrders?.filter(mo => mo.status === "COMPLETED") || []).length.toString(), type: "number", icon: "CheckCircle", description: "Number of completed orders", sparklineData: [(inventory.manufacturingOrders?.filter(mo => mo.status === "COMPLETED") || []).length] },
                    { title: "Orders In Progress", value: (inventory.manufacturingOrders?.filter(mo => mo.status === "IN_PROGRESS") || []).length.toString(), type: "number", icon: "Clock", description: "Number of orders in progress", sparklineData: [(inventory.manufacturingOrders?.filter(mo => mo.status === "IN_PROGRESS") || []).length] }
                ];
            default:
                return [];
        }
    }, [inventory, activeTab]);


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
                {kpiCards.map((card, index) => (
                    <DashboardCard key={index} card={card as CardData} />
                ))}
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