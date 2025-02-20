// src/components/transport/RouteManagement.tsx
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
import {AddRouteModal} from "@/components/transport/route/AddRouteModal"
import {EditRouteModal} from "@/components/transport/route/EditRouteModal"
import {DeleteRouteModal} from "@/components/transport/route/DeleteRouteModal"

export function RouteManagement() {
    const dispatch = useDispatch<AppDispatch>()
    const routes = useSelector((state: RootState) => state.shipment.routes)
    const [selectedRoute, setSelectedRoute] = useState<Route | null>(null)
    const [isAddingRoute, setIsAddingRoute] = useState(false)

    const [addModalOpen, setAddModalOpen] = useState(false)
    const [editModalOpen, setEditModalOpen] = useState(false)
    const [deleteModalOpen, setDeleteModalOpen] = useState(false)

    useEffect(() => {
        dispatch(fetchRoutes())
    }, [dispatch])

    const columns: ColumnDef<Route>[] = [
        { accessorKey: "name", header: "Name" },
        { accessorKey: "startLocation", header: "Start Location" },
        { accessorKey: "endLocation", header: "End Location" },
        { accessorKey: "distance", header: "Distance (km)" },
        { accessorKey: "estimatedDuration", header: "Est. Duration (hours)" },
    ]

    const handleAddModalOpen = () => {
        setAddModalOpen(true)
    }

    const handleAddModalClose = () => {
        setAddModalOpen(false)
    }

    const handleEditRoute = (route: Route) => {
        setSelectedRoute(route)
        setEditModalOpen(true)
    }

    const handleEditModalClose = () => {
        setSelectedRoute(null)
        setEditModalOpen(false)
    }

    const handleDeleteRoute = (route: Route) => {
        setSelectedRoute(route)
        setDeleteModalOpen(true)
    }

    const handleCloseDeleteModal = () => {
        setSelectedRoute(null)
        setDeleteModalOpen(false)
    }

    return (
        <div>
            <div className="flex justify-between flex-wrap items-center">
                <h3 className="text-xl font-semibold mb-4">Route Management</h3>
                <Button onClick={handleAddModalOpen} className="mb-4">
                    Add Route
                </Button>
            </div>
            <DataTable
                columns={columns}
                data={routes}
                onEdit={handleEditRoute}
                onDelete={handleDeleteRoute}
            />
            <AddRouteModal open={addModalOpen} onClose={handleAddModalClose} />
            {selectedRoute && (
                <EditRouteModal
                    open={editModalOpen}
                    onClose={handleEditModalClose}
                    route={selectedRoute}
                />
            )}
            {selectedRoute && (
                <DeleteRouteModal
                    open={deleteModalOpen}
                    onClose={handleCloseDeleteModal}
                    route={selectedRoute}
                    deleteModalTitle="Delete Route"
                />
            )}
        </div>
    )
}