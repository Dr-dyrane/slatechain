"use client"

import { useState, useMemo, use, useEffect } from "react"
import type { Shipment } from "@/lib/types"
import { ListCard } from "@/components/table/List-card"
import type { ColumnDef } from "@tanstack/react-table"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ShipmentDetails } from "./ShipmentDetails"

interface ShipmentListProps {
    shipments: Shipment[]
    onSelectShipment: (shipment: Shipment) => void
}

export function ShipmentList({ shipments, onSelectShipment }: ShipmentListProps) {
    const [searchTerm, setSearchTerm] = useState("")
    const [statusFilter, setStatusFilter] = useState<string>("ALL");
    const [sortBy, setSortBy] = useState<keyof Shipment>("estimatedDeliveryDate")
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")

    const columns: ColumnDef<Shipment>[] = [
        {
            accessorKey: "name",
            header: "Name",
        },
        {
            accessorKey: "trackingNumber",
            header: "Tracking Number",
        },
        {
            accessorKey: "status",
            header: "Status",
        },
        {
            accessorKey: "destination",
            header: "Destination",
        },
        {
            accessorKey: "estimatedDeliveryDate",
            header: "Estimated Delivery",
            cell: ({ row }) => {
                const date = new Date(row.getValue("estimatedDeliveryDate") || new Date())
                return date.toLocaleDateString()
            },
        },
    ]


    const filteredAndSortedShipments = useMemo(() => {

        if (!shipments || shipments.length === 0) {
            return [];
        }

        const filtered = shipments.filter((shipment) => {
            const statusMatches = statusFilter === "ALL" || !statusFilter || shipment?.status === statusFilter;
            const nameMatches = !searchTerm || shipment?.name?.toLowerCase()?.includes(searchTerm.toLowerCase());

            return statusMatches && nameMatches;
        });


        // If no sorting field is selected, return filtered list without sorting
        if (!sortBy) return filtered;

        const sorted = [...filtered].sort((a, b) => {
            const aValue = a?.[sortBy] ?? "";
            const bValue = b?.[sortBy] ?? "";

            if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
            if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
            return 0;
        });

        return sorted;
    }, [shipments, searchTerm, statusFilter, sortBy, sortOrder]);





    return (
        <div>
            <div className="mb-4 flex flex-col gap-2">
                <Input
                    placeholder="Search by shipment name"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                        <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value='ALL'>All</SelectItem>
                        <SelectItem value="PREPARING">Preparing</SelectItem>
                        <SelectItem value="IN_TRANSIT">In Transit</SelectItem>
                        <SelectItem value="DELIVERED">Delivered</SelectItem>
                    </SelectContent>
                </Select>
                <Select value={sortBy} onValueChange={(value) => setSortBy(value as keyof Shipment)}>
                    <SelectTrigger>
                        <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="estimatedDeliveryDate">Estimated Delivery</SelectItem>
                        <SelectItem value="status">Status</SelectItem>
                        <SelectItem value="destination">Destination</SelectItem>
                    </SelectContent>
                </Select>
                <Select value={sortOrder} onValueChange={(value) => setSortOrder(value as "asc" | "desc")}>
                    <SelectTrigger>
                        <SelectValue placeholder="Sort order" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="asc">Ascending</SelectItem>
                        <SelectItem value="desc">Descending</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="max-h-[300px] overflow-y-auto">
                <ListCard
                    columns={columns}
                    data={filteredAndSortedShipments}
                    onEdit={onSelectShipment}
                />
            </div>

        </div>
    )
}

