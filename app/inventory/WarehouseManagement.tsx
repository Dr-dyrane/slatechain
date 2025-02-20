"use client";

import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/lib/store";
import { fetchWarehouses } from "@/lib/slices/inventorySlice";
import { Warehouse } from "@/lib/types";
import { DataTable } from "@/components/table/DataTable";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { AddWarehouseModal } from "@/components/inventory/warehouse/AddWarehouseModal";
import { EditWarehouseModal } from "@/components/inventory/warehouse/EditWarehouseModal";
import { DeleteWarehouseModal } from "@/components/inventory/warehouse/DeleteWarehouseModal";

const columns = [
    { accessorKey: "name", header: "Name" },
    { accessorKey: "location", header: "Location" },
    { accessorKey: "capacity", header: "Capacity" },
    { accessorKey: "utilizationPercentage", header: "Utilization" },
    { accessorKey: "status", header: "Status" },
];

export function WarehouseManagement() {
    const dispatch = useDispatch<AppDispatch>();
    const warehouses = useSelector((state: RootState) => state.inventory.warehouses);

    const [addModalOpen, setAddModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | null>(null);

    useEffect(() => {
        dispatch(fetchWarehouses());
    }, [dispatch]);

    const handleAddModalOpen = () => {
        setAddModalOpen(true);
    };

    const handleAddModalClose = () => {
        setAddModalOpen(false);
    };

    const handleEditWarehouse = (warehouse: Warehouse) => {
        setSelectedWarehouse(warehouse);
        setEditModalOpen(true);
    };

    const handleEditModalClose = () => {
        setSelectedWarehouse(null);
        setEditModalOpen(false);
    };

    const handleDeleteWarehouse = (warehouse: Warehouse) => {
        setSelectedWarehouse(warehouse);
        setDeleteModalOpen(true);
    };

    const handleCloseDeleteModal = () => {
        setSelectedWarehouse(null);
        setDeleteModalOpen(false);
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
                <p className="text-muted-foreground">Manage your warehouses and their details.</p>
                <Button onClick={handleAddModalOpen}>
                    <PlusIcon className="mr-2 h-4 w-4" /> Add Warehouse
                </Button>
            </div>

            <DataTable
                columns={columns}
                data={warehouses}
                onEdit={handleEditWarehouse}
                onDelete={handleDeleteWarehouse}
            />

            <AddWarehouseModal open={addModalOpen} onClose={handleAddModalClose} />
            {selectedWarehouse && (
                <EditWarehouseModal
                    open={editModalOpen}
                    onClose={handleEditModalClose}
                    warehouse={selectedWarehouse}
                />
            )}
            {selectedWarehouse && (
                <DeleteWarehouseModal
                    open={deleteModalOpen}
                    onClose={handleCloseDeleteModal}
                    warehouse={selectedWarehouse}
                    deleteModalTitle="Delete Warehouse"
                />
            )}
        </div>
    );
}