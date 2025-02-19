"use client"

import type React from "react"

import { useState } from "react"
import { useDispatch } from "react-redux"
import type { AppDispatch } from "@/lib/store"
import type { Shipment } from "@/lib/types"
import { addShipment, updateShipment } from "@/lib/slices/shipmentSlice"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type ShipmentStatus = "PREPARING" | "IN_TRANSIT" | "DELIVERED"

interface ShipmentFormProps {
  shipment?: Shipment | null
  onClose: () => void
}

export function ShipmentForm({ shipment, onClose }: ShipmentFormProps) {
  const dispatch = useDispatch<AppDispatch>()
  const [formData, setFormData] = useState<Partial<Shipment>>(shipment || {})

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (shipment) {
      dispatch(updateShipment({ ...shipment, ...formData } as Shipment))
    } else {
      dispatch(addShipment(formData as Omit<Shipment, "id">))
    }
    onClose()
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{shipment ? "Edit Shipment" : "Add Shipment"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="orderId">Order ID</Label>
            <Input id="orderId" name="orderId" value={formData.orderId || ""} onChange={handleChange} required />
          </div>
          <div>
            <Label htmlFor="trackingNumber">Tracking Number</Label>
            <Input
              id="trackingNumber"
              name="trackingNumber"
              value={formData.trackingNumber || ""}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <Label htmlFor="carrier">Carrier</Label>
            <Input id="carrier" name="carrier" value={formData.carrier || ""} onChange={handleChange} required />
          </div>
          <div>
            <Label htmlFor="status">Status</Label>
            <Select
              name="status"
              value={formData.status}
              onValueChange={(value) => setFormData({ ...formData, status: value as ShipmentStatus })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PREPARING">Preparing</SelectItem>
                <SelectItem value="IN_TRANSIT">In Transit</SelectItem>
                <SelectItem value="DELIVERED">Delivered</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="destination">Destination</Label>
            <Input
              id="destination"
              name="destination"
              value={formData.destination || ""}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <Label htmlFor="estimatedDeliveryDate">Estimated Delivery Date</Label>
            <Input
              id="estimatedDeliveryDate"
              name="estimatedDeliveryDate"
              type="datetime-local"
              value={formData.estimatedDeliveryDate || ""}
              onChange={handleChange}
              required
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">{shipment ? "Update" : "Add"} Shipment</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

