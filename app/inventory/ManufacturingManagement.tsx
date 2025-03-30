"use client";

import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/lib/store";
import { fetchManufacturingOrders } from "@/lib/slices/inventorySlice";
import { ManufacturingOrder } from "@/lib/types";
import { DataTable } from "@/components/table/DataTable";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { AddManufacturingOrderModal } from "@/components/inventory/manufacturing/AddManufacturingOrderModal";
import { EditManufacturingOrderModal } from "@/components/inventory/manufacturing/EditManufacturingOrderModal";
import { DeleteManufacturingOrderModal } from "@/components/inventory/manufacturing/DeleteManufacturingOrderModal";
import { Badge } from "@/components/ui/badge";
import { ColumnDef } from "@tanstack/react-table";

const columns: ColumnDef<ManufacturingOrder>[] = [
    { accessorKey: "orderNumber", header: "Order #" },
    { accessorKey: "name", header: "Name" },
    { accessorKey: "inventoryItemId", header: "Product ID" },
    { accessorKey: "quantity", header: "Quantity" },
    {
        accessorKey: "status", header: "Status",
        cell: ({ row }) => {
            return (
                <Badge variant={row.original.status === "PLANNED" ? "warning" : row.original.status === "IN_PROGRESS" ? "default" : row.original.status === "COMPLETED" ? "success" : "destructive"}>
                    {row.original.status}
                </Badge>
            );
        }
    },
];

export function ManufacturingManagement() {
    const dispatch = useDispatch<AppDispatch>();
    const manufacturingOrders = useSelector((state: RootState) => state.inventory.manufacturingOrders);

    const [addModalOpen, setAddModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [selectedManufacturingOrder, setSelectedManufacturingOrder] = useState<ManufacturingOrder | null>(null);

    useEffect(() => {
        dispatch(fetchManufacturingOrders());
    }, [dispatch]);

    const handleAddModalOpen = () => {
        setAddModalOpen(true);
    };

    const handleAddModalClose = () => {
        setAddModalOpen(false);
    };

    const handleEditManufacturingOrder = (manufacturingOrder: ManufacturingOrder) => {
        setSelectedManufacturingOrder(manufacturingOrder);
        setEditModalOpen(true);
    };

    const handleEditModalClose = () => {
        setSelectedManufacturingOrder(null);
        setEditModalOpen(false);
    };

    const handleDeleteManufacturingOrder = (manufacturingOrder: ManufacturingOrder) => {
        setSelectedManufacturingOrder(manufacturingOrder);
        setDeleteModalOpen(true);
    };

    const handleCloseDeleteModal = () => {
        setSelectedManufacturingOrder(null);
        setDeleteModalOpen(false);
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
                <p className="text-muted-foreground">Manage manufacturing orders and production planning.</p>
                <Button onClick={handleAddModalOpen}>
                    <PlusIcon className="mr-2 h-4 w-4" /> Add Order
                </Button>
            </div>
            <DataTable
                columns={columns}
                data={manufacturingOrders}
                onEdit={handleEditManufacturingOrder}
                onDelete={handleDeleteManufacturingOrder}
            />
            <AddManufacturingOrderModal open={addModalOpen} onClose={handleAddModalClose} />
            {selectedManufacturingOrder && (
                <EditManufacturingOrderModal
                    open={editModalOpen}
                    onClose={handleEditModalClose}
                    manufacturingOrder={selectedManufacturingOrder}
                />
            )}
            {selectedManufacturingOrder && (
                <DeleteManufacturingOrderModal
                    open={deleteModalOpen}
                    onClose={handleCloseDeleteModal}
                    manufacturingOrder={selectedManufacturingOrder}
                    deleteModalTitle="Delete Manufacturing Order"
                />
            )}
        </div>
    );
}