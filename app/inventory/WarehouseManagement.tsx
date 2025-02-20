"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import type { AppDispatch, RootState } from "@/lib/store"
import { fetchWarehouses, addWarehouse, updateWarehouse, deleteWarehouse } from "@/lib/slices/inventorySlice"
import type { Warehouse } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DataTable } from "@/components/table/DataTable"
import type { ColumnDef } from "@tanstack/react-table"
import { toast } from "sonner"

export function WarehouseManagement() {
  const dispatch = useDispatch<AppDispatch>()
  const { warehouses, loading } = useSelector((state: RootState) => state.inventory)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | null>(null)
  const [formData, setFormData] = useState<Partial<Warehouse>>({})

  useEffect(() => {
    dispatch(fetchWarehouses())
  }, [dispatch])

  const columns: ColumnDef<Warehouse>[] = [
    { accessorKey: "name", header: "Name" },
    { accessorKey: "location", header: "Location" },
    { accessorKey: "capacity", header: "Capacity" },
    { accessorKey: "utilizationPercentage", header: "Utilization %" },
    { accessorKey: "status", header: "Status" },
    {
      id: "actions",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => handleEdit(row.original)}>
            Edit
          </Button>
          <Button variant="destructive" size="sm" onClick={() => handleDelete(row.original.id)}>
            Delete
          </Button>
        </div>
      ),
    },
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (selectedWarehouse) {
        await dispatch(updateWarehouse({ ...selectedWarehouse, ...formData } as Warehouse)).unwrap()
        toast.success("Warehouse updated successfully")
      } else {
        await dispatch(
          addWarehouse({
            ...formData,
            zones: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          } as Warehouse),
        ).unwrap()
        toast.success("Warehouse added successfully")
      }
      setIsAddModalOpen(false)
      resetForm()
    } catch (error) {
      toast.error("Failed to save warehouse")
    }
  }

  const handleEdit = (warehouse: Warehouse) => {
    setSelectedWarehouse(warehouse)
    setFormData(warehouse)
    setIsAddModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    try {
      await dispatch(deleteWarehouse(id)).unwrap()
      toast.success("Warehouse deleted successfully")
    } catch (error) {
      toast.error("Failed to delete warehouse")
    }
  }

  const resetForm = () => {
    setSelectedWarehouse(null)
    setFormData({})
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Warehouse Management</h2>
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogTrigger asChild>
            <Button>Add Warehouse</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{selectedWarehouse ? "Edit" : "Add"} Warehouse</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name || ""}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location || ""}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="capacity">Capacity</Label>
                <Input
                  id="capacity"
                  type="number"
                  value={formData.capacity || ""}
                  onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value as Warehouse["status"] })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="INACTIVE">Inactive</SelectItem>
                    <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Saving..." : "Save"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Warehouses</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{warehouses.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Capacity</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{warehouses.reduce((sum, warehouse) => sum + warehouse.capacity, 0)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Average Utilization</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {Math.round(
                warehouses.reduce((sum, warehouse) => sum + warehouse.utilizationPercentage, 0) /
                  (warehouses.length || 1),
              )}
              %
            </p>
          </CardContent>
        </Card>
      </div>

      <DataTable columns={columns} data={warehouses} />
    </div>
  )
}

