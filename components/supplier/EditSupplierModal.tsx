"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import type { Supplier } from "@/lib/types"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { X } from "lucide-react"
import { prepareSupplierData, extractNameParts, type SupplierFormData } from "@/lib/utils"

const editSupplierSchema = z.object({
  id: z.string().min(1, "ID is required"),
  name: z.string().min(1, "Name is required"),
  contactPerson: z.string().min(1, "Contact Person is required"),
  email: z.string().email("Invalid email address"),
  phoneNumber: z.string().min(7, "Phone number should be at least 7 characters long"),
  address: z.string().min(1, "Address is required"),
  rating: z.number().min(0).max(5),
  status: z.enum(["ACTIVE", "INACTIVE"]),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
})

type EditSupplierFormValues = z.infer<typeof editSupplierSchema>

interface EditSupplierModalProps {
  open: boolean
  onClose: () => void
  onSave: (supplier: Supplier) => void
  supplier: Supplier | null
}

export function EditSupplierModal({ open, onClose, onSave, supplier }: EditSupplierModalProps) {
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EditSupplierFormValues>({
    resolver: zodResolver(editSupplierSchema),
  })

  useEffect(() => {
    if (supplier) {
      // Extract first and last name from the supplier name
      const { firstName, lastName } = extractNameParts(supplier)

      reset({
        ...supplier,
        firstName,
        lastName,
      })
    }
  }, [supplier, reset])

  const onSubmit = async (data: EditSupplierFormValues) => {
    setLoading(true)
    try {
      // Create a supplier data object with the form values
      const supplierData: SupplierFormData = {
        ...data,
        // Ensure we keep the ID and timestamps
        userId: supplier?.id,
        createdAt: supplier?.createdAt,
        updatedAt: new Date().toISOString(),
      }

      // Convert to proper Supplier type
      const formattedSupplier = prepareSupplierData(supplierData)
      const thunkData = { ...formattedSupplier, id: supplier?.id }

      await onSave(thunkData as any)
      onClose()
    } catch (error) {
      console.error("Error updating supplier:", error)
    } finally {
      setLoading(false)
    }
  }

  if (!supplier) return null

  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent className="w-full max-w-md rounded-2xl sm:max-w-lg mx-auto max-h-[80vh] overflow-y-auto">
        <AlertDialogHeader>
          <div className="flex justify-center items-center relative">
            <AlertDialogTitle>Edit Supplier</AlertDialogTitle>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 absolute -top-4 sm:-top-1 -right-4 p-2 bg-muted rounded-full"
            >
              <X className="w-5 h-5 " />
            </button>
          </div>
          <AlertDialogDescription>Update the supplier's information below. <br />
            <span className="italic text-xs">{supplier.id}</span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <input type="hidden" {...register("id")} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input id="firstName" {...register("firstName")} className="input-focus input-hover" />
              {errors.firstName && <p className="text-sm text-red-500">{errors.firstName.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input id="lastName" {...register("lastName")} className="input-focus input-hover" />
              {errors.lastName && <p className="text-sm text-red-500">{errors.lastName.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...register("email")} className="input-focus input-hover" />
            {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phoneNumber">Phone Number</Label>
            <Input id="phoneNumber" {...register("phoneNumber")} className="input-focus input-hover" />
            {errors.phoneNumber && <p className="text-sm text-red-500">{errors.phoneNumber.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input id="address" {...register("address")} className="input-focus input-hover" />
            {errors.address && <p className="text-sm text-red-500">{errors.address.message}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="rating">Rating</Label>
              <Input
                id="rating"
                type="number"
                step="0.1"
                min="0"
                max="5"
                {...register("rating", { valueAsNumber: true })}
                className="input-focus input-hover"
              />
              {errors.rating && <p className="text-sm text-red-500">{errors.rating.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <select id="status" {...register("status")} className="w-full p-2 border rounded">
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
              {errors.status && <p className="text-sm text-red-500">{errors.status.message}</p>}
            </div>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  )
}

