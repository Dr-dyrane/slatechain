// src/components/transport/FreightManagement.tsx
"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import type { RootState, AppDispatch } from "@/lib/store"
import { fetchFreights, addFreight, updateFreight, removeFreight } from "@/lib/slices/shipmentSlice"
import type { Freight } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { DataTable } from "@/components/table/DataTable"
import type { ColumnDef } from "@tanstack/react-table"
import { CheckedState } from "@radix-ui/react-checkbox"
import { AddFreightModal } from "@/components/transport/freight/AddFreightModal"
import { EditFreightModal } from "@/components/transport/freight/EditFreightModal"
import { DeleteFreightModal } from "@/components/transport/freight/DeleteFreightModal"
import { Check, CirclePlus, X } from "lucide-react"

export function FreightManagement() {
    const dispatch = useDispatch<AppDispatch>()
    const freights = useSelector((state: RootState) => state.shipment.freights)
    const [selectedFreight, setSelectedFreight] = useState<Freight | null>(null)
    const [isAddingFreight, setIsAddingFreight] = useState(false)

    const [addModalOpen, setAddModalOpen] = useState(false)
    const [editModalOpen, setEditModalOpen] = useState(false)
    const [deleteModalOpen, setDeleteModalOpen] = useState(false)

    useEffect(() => {
        dispatch(fetchFreights())
    }, [dispatch])

    const columns: ColumnDef<Freight>[] = [
        { accessorKey: "type", header: "Type" },
        {
            accessorKey: "name",
            header: "Name",
            cell: ({ row }) => row.original.freightNumber ?? "N/A",
        },
        {
            accessorKey: "weight",
            header: "Weight (kg)",
            cell: ({ row }) => {
                const weight = row.original.cargo?.totalWeight ?? 0;
                return `${weight} kg`;
            },
        },
        {
            accessorKey: "volume",
            header: "Volume (m³)",
            cell: ({ row }) => {
                const volume = row.original.cargo?.totalVolume ?? 0;
                return `${volume} m³`;
            },
        },
        {
            accessorKey: "hazardous",
            header: "Hazardous",
            cell: ({ row }) => {
                const isHazardous = row.original.cargo?.hazmat === false;
                return isHazardous ? (
                    <div className="flex items-center space-x-2">
                        <X className="w-4 h-4 text-red-500" />
                        <span>No</span>
                    </div>
                ) : (
                    <div className="flex items-center space-x-2">
                        <Check className="w-4 h-4 text-green-500" />
                        <span>Yes</span>
                    </div>
                );
            },
        },
        { accessorKey: "notes", header: "Special Instructions" },
    ];

    const handleAddModalOpen = () => {
        setAddModalOpen(true)
    }

    const handleAddModalClose = () => {
        setAddModalOpen(false)
    }

    const handleEditFreight = (freight: Freight) => {
        setSelectedFreight(freight)
        setEditModalOpen(true)
    }

    const handleEditModalClose = () => {
        setSelectedFreight(null)
        setEditModalOpen(false)
    }

    const handleDeleteFreight = (freight: Freight) => {
        setSelectedFreight(freight)
        setDeleteModalOpen(true)
    }

    const handleCloseDeleteModal = () => {
        setSelectedFreight(null)
        setDeleteModalOpen(false)
    }

    return (
        <div>
            <div className="flex justify-between flex-wrap items-center">
                <h3 className="text-xl font-semibold mb-4">Freight Management</h3>
                <Button onClick={handleAddModalOpen} className="mb-4">
                    <CirclePlus />
                    <span className="hidden sm:flex ml-2">Add Freight</span>
                </Button>
            </div>
            <DataTable
                columns={columns}
                data={freights}
                onEdit={handleEditFreight}
                onDelete={handleDeleteFreight}
            />
            <AddFreightModal open={addModalOpen} onClose={handleAddModalClose} />
            {selectedFreight && (
                <EditFreightModal
                    open={editModalOpen}
                    onClose={handleEditModalClose}
                    freight={selectedFreight}
                />
            )}
            {selectedFreight && (
                <DeleteFreightModal
                    open={deleteModalOpen}
                    onClose={handleCloseDeleteModal}
                    freight={selectedFreight}
                    deleteModalTitle="Delete Freight"
                />
            )}
        </div>
    )
}