// src/components/transport/CarrierManagement.tsx
"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import type { RootState, AppDispatch } from "@/lib/store"

import type { Carrier } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DataTable } from "@/components/table/DataTable"
import type { ColumnDef } from "@tanstack/react-table"
import { fetchCarriers, removeCarrier, updateCarrier, addCarrier } from "@/lib/slices/shipmentSlice"
import { AddCarrierModal } from "@/components/transport/carrier/AddCarrierModal"
import { EditCarrierModal } from "@/components/transport/carrier/EditCarrierModal"
import { DeleteCarrierModal } from "@/components/transport/carrier/DeleteCarrierModal"
import { CirclePlus } from "lucide-react"


export function CarrierManagement() {
    const dispatch = useDispatch<AppDispatch>()
    const carriers = useSelector((state: RootState) => state.shipment.carriers)
    const [selectedCarrier, setSelectedCarrier] = useState<Carrier | null>(null)
    const [isAddingCarrier, setIsAddingCarrier] = useState(false)

    const [addModalOpen, setAddModalOpen] = useState(false)
    const [editModalOpen, setEditModalOpen] = useState(false)
    const [deleteModalOpen, setDeleteModalOpen] = useState(false)

    useEffect(() => {
        dispatch(fetchCarriers())
    }, [dispatch])

    const columns: ColumnDef<Carrier>[] = [
        { accessorKey: "name", header: "Name" },
        { accessorKey: "contactPerson", header: "Contact Person" },
        { accessorKey: "email", header: "Email" },
        { accessorKey: "phone", header: "Phone" },
    ]

    const handleAddModalOpen = () => {
        setAddModalOpen(true)
    }

    const handleAddModalClose = () => {
        setAddModalOpen(false)
    }

    const handleEditCarrier = (carrier: Carrier) => {
        setSelectedCarrier(carrier)
        setEditModalOpen(true)
    }

    const handleEditModalClose = () => {
        setSelectedCarrier(null)
        setEditModalOpen(false)
    }

    const handleDeleteCarrier = (carrier: Carrier) => {
        setSelectedCarrier(carrier)
        setDeleteModalOpen(true)
    }

    const handleCloseDeleteModal = () => {
        setSelectedCarrier(null)
        setDeleteModalOpen(false)
    }

    return (
        <div>
            <div className="flex justify-between flex-wrap items-center">
                <h3 className="text-xl font-semibold mb-4">Carrier Management</h3>
                <Button onClick={handleAddModalOpen} className="mb-4">
                    <CirclePlus />
                    <span className="hidden sm:flex ml-2">Add Carrier</span>
                </Button>
            </div>
            <DataTable
                columns={columns}
                data={carriers}
                onEdit={handleEditCarrier}
                onDelete={handleDeleteCarrier}
            />
            <AddCarrierModal open={addModalOpen} onClose={handleAddModalClose} />
            {selectedCarrier && (
                <EditCarrierModal
                    open={editModalOpen}
                    onClose={handleEditModalClose}
                    carrier={selectedCarrier}
                />
            )}
            {selectedCarrier && (
                <DeleteCarrierModal
                    open={deleteModalOpen}
                    onClose={handleCloseDeleteModal}
                    carrier={selectedCarrier}
                    deleteModalTitle="Delete Carrier"
                />
            )}
        </div>
    )
}
