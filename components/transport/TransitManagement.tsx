// src/components/transport/TransportManagement.tsx
"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "@/lib/store";
import type { GeoLocation, Transport } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/table/DataTable";
import type { ColumnDef } from "@tanstack/react-table";
import {
  fetchTransports,
} from "@/lib/slices/shipmentSlice";
import { AddTransportModal } from "@/components/transport/transport/AddTransportModal"; // Assuming you'll create these
import { EditTransportModal } from "@/components/transport/transport/EditTransportModal";
import { DeleteTransportModal } from "@/components/transport/transport/DeleteTransportModal";
import { CirclePlus } from "lucide-react";
import { Badge } from "../ui/badge";

export function TransitManagement() {
  const dispatch = useDispatch<AppDispatch>();
  const transports = useSelector(
    (state: RootState) => state.shipment.transports
  );
  const [selectedTransport, setSelectedTransport] = useState<Transport | null>(
    null
  );

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchTransports()); // Fetch transports on component mount
  }, [dispatch]);

  const columns: ColumnDef<Transport>[] = [
    { accessorKey: "name", header: "Name" },
    { accessorKey: "type", header: "Type" },
    { accessorKey: "capacity", header: "Capacity" },
    {
      accessorKey: "currentLocation",
      header: "Current Location",
      cell: ({ row }) => {
        const location = row.original.currentLocation;
        return `${location.latitude}, ${location.longitude}`;
      },
    },

    { accessorKey: "carrierId", header: "Carrier ID" }, // Add carrier ID if needed
    {
      accessorKey: "status", header: "Status",
      cell: ({ row }) => (
        // status: "AVAILABLE" | "IN_TRANSIT" | "MAINTENANCE";
        <Badge
          variant={
            row.original.status === "AVAILABLE"
              ? "default"
              : (row.original.status === "MAINTENANCE" ? "warning" : "success")
          }
        >
          {row.original.status}
        </Badge>
      ),
    }
  ];

  const handleAddModalOpen = () => setAddModalOpen(true);

  const handleAddModalClose = () => setAddModalOpen(false);

  const handleEditTransport = (transport: Transport) => {
    setSelectedTransport(transport);
    setEditModalOpen(true);
  };

  const handleEditModalClose = () => {
    setSelectedTransport(null);
    setEditModalOpen(false);
  };

  const handleDeleteTransport = (transport: Transport) => {
    setSelectedTransport(transport);
    setDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setSelectedTransport(null);
    setDeleteModalOpen(false);
  };

  return (
    <div>
      <div className="flex justify-between flex-wrap items-center">
        <h3 className="text-xl font-semibold mb-4">Transport Management</h3>
        <Button onClick={handleAddModalOpen} className="mb-4">
          <CirclePlus />
          <span className="hidden sm:flex ml-2">Add Transport</span>
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={transports}
        onEdit={handleEditTransport}
        onDelete={handleDeleteTransport}
      />
      <AddTransportModal open={addModalOpen} onClose={handleAddModalClose} />

      {selectedTransport && (
        <EditTransportModal
          open={editModalOpen}
          onClose={handleEditModalClose}
          transport={selectedTransport}
        />
      )}

      {selectedTransport && (
        <DeleteTransportModal
          open={deleteModalOpen}
          onClose={handleCloseDeleteModal}
          transport={selectedTransport}
          deleteModalTitle="Delete Transport"
        />
      )}
    </div>
  );
}