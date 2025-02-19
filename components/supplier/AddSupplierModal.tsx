"use client"

import { useState } from "react"
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

const addSupplierSchema = z.object({
  name: z.string().min(1, "Name is required"),
  contactPerson: z.string().min(1, "Contact Person is required"),
  email: z.string().email("Invalid email address"),
  phoneNumber: z.string().min(7, "Phone number should be at least 7 characters long"),
  address: z.string().min(1, "Address is required"),
  rating: z.number().min(0).max(5),
  status: z.enum(["ACTIVE", "INACTIVE"]),
})

type AddSupplierFormValues = z.infer<typeof addSupplierSchema>

interface AddSupplierModalProps {
  open: boolean
  onClose: () => void
  onAdd: (supplier: Omit<Supplier, "id" | "createdAt" | "updatedAt">) => void
}

export function AddSupplierModal({ open, onClose, onAdd }: AddSupplierModalProps) {
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AddSupplierFormValues>({
    resolver: zodResolver(addSupplierSchema),
  })

  const onSubmit = async (data: AddSupplierFormValues) => {
    setLoading(true)
    try {
      await onAdd(data)
      reset()
      onClose()
    } catch (error) {
      console.error("Error adding supplier:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent className="w-full max-w-md rounded-2xl sm:max-w-lg mx-auto max-h-[80vh] overflow-y-auto">
        <AlertDialogHeader>
          <div className="flex justify-center items-center relative">
            <AlertDialogTitle>Add New Supplier</AlertDialogTitle>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 absolute -top-4 sm:-top-1 -right-4 p-2 bg-muted rounded-full"
            >
              <X className="w-5 h-5 " />
            </button>
          </div>
          <AlertDialogDescription>Enter the details for the new supplier.</AlertDialogDescription>
        </AlertDialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" {...register("name")} className="input-focus input-hover" />
            {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="contactPerson">Contact Person</Label>
            <Input id="contactPerson" {...register("contactPerson")} className="input-focus input-hover" />
            {errors.contactPerson && <p className="text-sm text-red-500">{errors.contactPerson.message}</p>}
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
          <div className="space-y-2">
            <Label htmlFor="rating">Rating</Label>
            <Input
              id="rating"
              type="number"
              step="0.1"
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
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <Button type="submit" disabled={loading}>
              {loading ? "Adding..." : "Add Supplier"}
            </Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  )
}

