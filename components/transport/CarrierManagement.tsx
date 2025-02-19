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
import { addCarrier, fetchCarriers, removeCarrier, updateCarrier } from "@/lib/slices/shipmentSlice"

export function CarrierManagement() {
    const dispatch = useDispatch<AppDispatch>()
    const carriers = useSelector((state: RootState) => state.shipment.carriers)
    const [selectedCarrier, setSelectedCarrier] = useState<Carrier | null>(null)
    const [isAddingCarrier, setIsAddingCarrier] = useState(false)
    const [formData, setFormData] = useState<Partial<Carrier>>({})

    useEffect(() => {
        dispatch(fetchCarriers())
    }, [dispatch])

    const columns: ColumnDef<Carrier>[] = [
        { accessorKey: "name", header: "Name" },
        { accessorKey: "contactPerson", header: "Contact Person" },
        { accessorKey: "email", header: "Email" },
        { accessorKey: "phone", header: "Phone" },
        {
            id: "actions",
            cell: ({ row }) => (
                <div>
                    <Button onClick={() => handleEdit(row.original)}>Edit</Button>
                    <Button onClick={() => handleDelete(row.original.id)} variant="destructive">
                        Delete
                    </Button>
                </div>
            ),
        },
    ]

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (selectedCarrier) {
            dispatch(updateCarrier({ ...selectedCarrier, ...formData } as Carrier))
        } else {
            dispatch(addCarrier(formData as Carrier))
        }
        resetForm()
    }

    const handleEdit = (carrier: Carrier) => {
        setSelectedCarrier(carrier)
        setFormData(carrier)
        setIsAddingCarrier(true)
    }

    const handleDelete = (id: string) => {
        dispatch(removeCarrier(id))
    }

    const resetForm = () => {
        setSelectedCarrier(null)
        setFormData({})
        setIsAddingCarrier(false)
    }

    return (
        <div>
            <div className="flex justify-between flex-wrap items-center">
                <h3 className="text-xl font-semibold mb-4">Carrier Management</h3>
                <Button onClick={() => setIsAddingCarrier(true)} className="mb-4">
                    Add Carrier
                </Button>
            </div>

            {isAddingCarrier && (
                <form onSubmit={handleSubmit} className="mb-4 space-y-4">
                    <Input
                        name="name"
                        placeholder="Carrier Name"
                        value={formData.name || ""}
                        onChange={handleInputChange}
                        required
                    />
                    <Input
                        name="contactPerson"
                        placeholder="Contact Person"
                        value={formData.contactPerson || ""}
                        onChange={handleInputChange}
                        required
                    />
                    <Input
                        name="email"
                        type="email"
                        placeholder="Email"
                        value={formData.email || ""}
                        onChange={handleInputChange}
                        required
                    />
                    <Input name="phone" placeholder="Phone" value={formData.phone || ""} onChange={handleInputChange} required />
                    <Button type="submit">{selectedCarrier ? "Update" : "Add"} Carrier</Button>
                    <Button type="button" onClick={resetForm} variant="outline">
                        Cancel
                    </Button>
                </form>
            )}

            <DataTable columns={columns} data={carriers} />
        </div>
    )
}

