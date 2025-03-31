// src/components/transport/CarrierManagement.tsx
"use client"

import { useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import type { RootState, AppDispatch } from "@/lib/store"
import type { Carrier } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/table/DataTable"
import type { ColumnDef } from "@tanstack/react-table"
import { fetchCarriers } from "@/lib/slices/shipmentSlice"
import { AddCarrierModal } from "@/components/transport/carrier/AddCarrierModal"
import { EditCarrierModal } from "@/components/transport/carrier/EditCarrierModal"
import { DeleteCarrierModal } from "@/components/transport/carrier/DeleteCarrierModal"
import { Badge } from "@/components/ui/badge"
import { CirclePlus, Star, StarHalf } from "lucide-react"

export function CarrierManagement() {
    const dispatch = useDispatch<AppDispatch>()
    const carriers = useSelector((state: RootState) => state.shipment.carriers)
    const [selectedCarrier, setSelectedCarrier] = useState<Carrier | null>(null)

    const [addModalOpen, setAddModalOpen] = useState(false)
    const [editModalOpen, setEditModalOpen] = useState(false)
    const [deleteModalOpen, setDeleteModalOpen] = useState(false)

    useEffect(() => {
        dispatch(fetchCarriers())
    }, [dispatch])

    const columns: ColumnDef<Carrier>[] = [
        {
            accessorKey: "name",
            header: "Name",
        },
        {
            accessorKey: "contactPerson",
            header: "Contact Person",
        },
        {
            accessorKey: "email",
            header: "Email",
        },
        {
            accessorKey: "phone",
            header: "Phone",
        },
        {
            accessorKey: "rating",
            header: "Rating",
            cell: ({ row }) => {
                const rating = row.getValue("rating") as number
                return (
                    <div className="flex items-center">
                        {rating > 0
                            ? Array.from({ length: Math.floor(rating) }).map((_, i) => (
                                <Star key={i} className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                            ))
                            : null}
                        {rating % 1 !== 0 && <StarHalf className="h-4 w-4 text-yellow-400 fill-yellow-400" />}
                        <span className="ml-1">{rating.toFixed(1)}</span>
                    </div>
                )
            },
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => {
                const status = row.getValue("status") as string
                return <Badge variant={status === "ACTIVE" ? "success" : "destructive"}>{status}</Badge>
            },
        },
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
            <DataTable columns={columns} data={carriers} onEdit={handleEditCarrier} onDelete={handleDeleteCarrier} />
            <AddCarrierModal open={addModalOpen} onClose={handleAddModalClose} />
            {selectedCarrier && (
                <EditCarrierModal open={editModalOpen} onClose={handleEditModalClose} carrier={selectedCarrier} />
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

