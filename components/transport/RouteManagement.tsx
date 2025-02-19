"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import type { RootState, AppDispatch } from "@/lib/store"
import { fetchRoutes, addRoute, updateRoute, removeRoute } from "@/lib/slices/shipmentSlice"
import type { Route } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DataTable } from "@/components/table/DataTable"
import type { ColumnDef } from "@tanstack/react-table"

export function RouteManagement() {
    const dispatch = useDispatch<AppDispatch>()
    const routes = useSelector((state: RootState) => state.shipment.routes)
    const [selectedRoute, setSelectedRoute] = useState<Route | null>(null)
    const [isAddingRoute, setIsAddingRoute] = useState(false)
    const [formData, setFormData] = useState<Partial<Route>>({})

    useEffect(() => {
        dispatch(fetchRoutes())
    }, [dispatch])

    const columns: ColumnDef<Route>[] = [
        { accessorKey: "name", header: "Name" },
        { accessorKey: "startLocation", header: "Start Location" },
        { accessorKey: "endLocation", header: "End Location" },
        { accessorKey: "distance", header: "Distance (km)" },
        { accessorKey: "estimatedDuration", header: "Est. Duration (hours)" },
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
        if (selectedRoute) {
            dispatch(updateRoute({ ...selectedRoute, ...formData } as Route))
        } else {
            dispatch(addRoute(formData as Route))
        }
        resetForm()
    }

    const handleEdit = (route: Route) => {
        setSelectedRoute(route)
        setFormData(route)
        setIsAddingRoute(true)
    }

    const handleDelete = (id: string) => {
        dispatch(removeRoute(id))
    }

    const resetForm = () => {
        setSelectedRoute(null)
        setFormData({})
        setIsAddingRoute(false)
    }

    return (
        <div>
            <div className="flex justify-between flex-wrap items-center">
                <h3 className="text-xl font-semibold mb-4">Route Management</h3>
                <Button onClick={() => setIsAddingRoute(true)} className="mb-4">
                    Add Route
                </Button>
            </div>

            {isAddingRoute && (
                <form onSubmit={handleSubmit} className="mb-4 space-y-4">
                    <Input
                        name="name"
                        placeholder="Route Name"
                        value={formData.name || ""}
                        onChange={handleInputChange}
                        required
                    />
                    <Input
                        name="startLocation"
                        placeholder="Start Location"
                        value={formData.startLocation || ""}
                        onChange={handleInputChange}
                        required
                    />
                    <Input
                        name="endLocation"
                        placeholder="End Location"
                        value={formData.endLocation || ""}
                        onChange={handleInputChange}
                        required
                    />
                    <Input
                        name="distance"
                        type="number"
                        placeholder="Distance (km)"
                        value={formData.distance || ""}
                        onChange={handleInputChange}
                        required
                    />
                    <Input
                        name="estimatedDuration"
                        type="number"
                        placeholder="Estimated Duration (hours)"
                        value={formData.estimatedDuration || ""}
                        onChange={handleInputChange}
                        required
                    />
                    <Button type="submit">{selectedRoute ? "Update" : "Add"} Route</Button>
                    <Button type="button" onClick={resetForm} variant="outline">
                        Cancel
                    </Button>
                </form>
            )}

            <DataTable columns={columns} data={routes} />
        </div>
    )
}

