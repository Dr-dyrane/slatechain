"use client";

import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/lib/store";
import { fetchWarehouses } from "@/lib/slices/inventorySlice";
import { Warehouse } from "@/lib/types";
import { DataTable } from "@/components/table/DataTable";
import { Button } from "@/components/ui/button";
import { CirclePlus } from "lucide-react";
import { AddWarehouseModal } from "@/components/inventory/warehouse/AddWarehouseModal";
import { EditWarehouseModal } from "@/components/inventory/warehouse/EditWarehouseModal";
import { DeleteWarehouseModal } from "@/components/inventory/warehouse/DeleteWarehouseModal";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";

const columns: ColumnDef<Warehouse>[] = [
    { accessorKey: "name", header: "Name" },
    { accessorKey: "location", header: "Location" },
    { accessorKey: "capacity", header: "Capacity" },
    { accessorKey: "utilizationPercentage", header: "Utilization" },
    {
        accessorKey: "status", header: "Status",
        cell: ({ row }) => {
            return (
                <Badge variant={row.original.status === "ACTIVE" ? "success" : row.original.status === "INACTIVE" ? "warning" : "destructive"}>
                    {row.original.status}
                </Badge>
            );
        }
    },
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
                    <CirclePlus />
                    <span className="hidden sm:flex ml-2">Add Warehouse</span>
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