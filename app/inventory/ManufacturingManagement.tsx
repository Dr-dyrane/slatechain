"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import type { AppDispatch, RootState } from "@/lib/store"
import {
  fetchManufacturingOrders,
  createManufacturingOrder,
  updateManufacturingOrder,
  deleteManufacturingOrder,
} from "@/lib/slices/inventorySlice"
import type { ManufacturingOrder } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DataTable } from "@/components/table/DataTable"
import type { ColumnDef } from "@tanstack/react-table"
import { toast } from "sonner"

export function ManufacturingManagement() {
  const dispatch = useDispatch<AppDispatch>()
  const { manufacturingOrders, loading } = useSelector((state: RootState) => state.inventory)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<ManufacturingOrder | null>(null)
  const [formData, setFormData] = useState<Partial<ManufacturingOrder>>({})

  useEffect(() => {
    dispatch(fetchManufacturingOrders())
  }, [dispatch])

  const columns: ColumnDef<ManufacturingOrder>[] = [
    { accessorKey: "name", header: "Name" },
    { accessorKey: "orderNumber", header: "Order Number" },
    { accessorKey: "quantity", header: "Quantity" },
    { accessorKey: "status", header: "Status" },
    { accessorKey: "priority", header: "Priority" },
    {
      accessorKey: "startDate",
      header: "Start Date",
      cell: ({ row }) => new Date(row.getValue("startDate")).toLocaleDateString(),
    },
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
      if (selectedOrder) {
        await dispatch(updateManufacturingOrder({ ...selectedOrder, ...formData } as ManufacturingOrder)).unwrap()
        toast.success("Manufacturing order updated successfully")
      } else {
        await dispatch(
          createManufacturingOrder({
            ...formData,
            orderNumber: `MO${Math.floor(Math.random() * 10000)}`,
            qualityChecks: [],
            billOfMaterials: {
              id: `BOM${Math.floor(Math.random() * 10000)}`,
              inventoryItemId: formData.inventoryItemId!,
              materials: [],
              laborHours: 0,
              machineHours: 0,
              instructions: "",
              version: "1.0",
            },
          } as ManufacturingOrder),
        ).unwrap()
        toast.success("Manufacturing order created successfully")
      }
      setIsAddModalOpen(false)
      resetForm()
    } catch (error) {
      toast.error("Failed to save manufacturing order")
    }
  }

  const handleEdit = (order: ManufacturingOrder) => {
    setSelectedOrder(order)
    setFormData(order)
    setIsAddModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    try {
      await dispatch(deleteManufacturingOrder(id)).unwrap()
      toast.success("Manufacturing order deleted successfully")
    } catch (error) {
      toast.error("Failed to delete manufacturing order")
    }
  }

  const resetForm = () => {
    setSelectedOrder(null)
    setFormData({})
  }

  const inProgressOrders = manufacturingOrders.filter((order) => order.status === "IN_PROGRESS").length
  const completedOrders = manufacturingOrders.filter((order) => order.status === "COMPLETED").length
  const plannedOrders = manufacturingOrders.filter((order) => order.status === "PLANNED").length

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Manufacturing & Production</h2>
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogTrigger asChild>
            <Button>Create Order</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{selectedOrder ? "Edit" : "Create"} Manufacturing Order</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="productId">Product ID</Label>
                <Input
                  id="productId"
                  value={formData.inventoryItemId || ""}
                  onChange={(e) => setFormData({ ...formData, inventoryItemId: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  value={formData.quantity || ""}
                  onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value as ManufacturingOrder["status"] })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PLANNED">Planned</SelectItem>
                    <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) =>
                    setFormData({ ...formData, priority: value as ManufacturingOrder["priority"] })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOW">Low</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="HIGH">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate?.split("T")[0] || ""}
                  onChange={(e) => setFormData({ ...formData, startDate: new Date(e.target.value).toISOString() })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate?.split("T")[0] || ""}
                  onChange={(e) => setFormData({ ...formData, endDate: new Date(e.target.value).toISOString() })}
                  required
                />
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
            <CardTitle>In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{inProgressOrders}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{completedOrders}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Planned</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{plannedOrders}</p>
          </CardContent>
        </Card>
      </div>

      <DataTable columns={columns} data={manufacturingOrders} />
    </div>
  )
}

