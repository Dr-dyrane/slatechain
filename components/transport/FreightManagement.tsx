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

export function FreightManagement() {
    const dispatch = useDispatch<AppDispatch>()
    const freights = useSelector((state: RootState) => state.shipment.freights)
    const [selectedFreight, setSelectedFreight] = useState<Freight | null>(null)
    const [isAddingFreight, setIsAddingFreight] = useState(false)
    const [formData, setFormData] = useState<Partial<Freight>>({})

    useEffect(() => {
        dispatch(fetchFreights())
    }, [dispatch])

    const columns: ColumnDef<Freight>[] = [
        { accessorKey: "type", header: "Type" },
        {
            accessorKey: "name",
            header: "Name",
        },
        { accessorKey: "weight", header: "Weight (kg)" },
        { accessorKey: "volume", header: "Volume (m³)" },
        { accessorKey: "hazardous", header: "Hazardous" },
        { accessorKey: "specialInstructions", header: "Special Instructions" },
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

    const handleCheckboxChange = (checked: CheckedState) => {
        setFormData((prev) => ({
            ...prev,
            hazardous: checked === true, // Ensure it's stored as a boolean
        }));
    };


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (selectedFreight) {
            dispatch(updateFreight({ ...selectedFreight, ...formData } as Freight))
        } else {
            dispatch(addFreight(formData as Freight))
        }
        resetForm()
    }

    const handleEdit = (freight: Freight) => {
        setSelectedFreight(freight)
        setFormData(freight)
        setIsAddingFreight(true)
    }

    const handleDelete = (id: string) => {
        dispatch(removeFreight(id))
    }

    const resetForm = () => {
        setSelectedFreight(null)
        setFormData({})
        setIsAddingFreight(false)
    }

    return (
        <div>
            <div className="flex justify-between flex-wrap items-center">
                <h3 className="text-xl font-semibold mb-4">Freight Management</h3>
                <Button onClick={() => setIsAddingFreight(true)} className="mb-4">
                    Add Freight
                </Button>
            </div>

            {isAddingFreight && (
                <form onSubmit={handleSubmit} className="mb-4 space-y-4">
                    <Input
                        name="type"
                        placeholder="Freight Type"
                        value={formData.type || ""}
                        onChange={handleInputChange}
                        required
                    />
                    <Input
                        name="weight"
                        type="number"
                        placeholder="Weight (kg)"
                        value={formData.weight || ""}
                        onChange={handleInputChange}
                        required
                    />
                    <Input
                        name="volume"
                        type="number"
                        placeholder="Volume (m³)"
                        value={formData.volume || ""}
                        onChange={handleInputChange}
                        required
                    />
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="hazardous"
                            name="hazardous"
                            checked={formData.hazardous || false}
                            onCheckedChange={handleCheckboxChange}
                        />
                        <label htmlFor="hazardous">Hazardous</label>
                    </div>
                    <Input
                        name="specialInstructions"
                        placeholder="Special Instructions"
                        value={formData.specialInstructions || ""}
                        onChange={handleInputChange}
                    />
                    <Button type="submit">{selectedFreight ? "Update" : "Add"} Freight</Button>
                    <Button type="button" onClick={resetForm} variant="outline">
                        Cancel
                    </Button>
                </form>
            )}

            <DataTable columns={columns} data={freights} />
        </div>
    )
}

