"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import type { Supplier, UserRole } from "@/lib/types"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const addSupplierSchema = z.object({
  // User fields
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phoneNumber: z.string().min(7, "Phone number should be at least 7 characters long"),

  // Supplier-specific fields
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
  const [activeTab, setActiveTab] = useState("new")

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AddSupplierFormValues>({
    resolver: zodResolver(addSupplierSchema),
    defaultValues: {
      rating: 3,
      status: "ACTIVE",
    },
  })

  const onSubmit = async (data: AddSupplierFormValues) => {
    setLoading(true)
    try {
      // Create a full name from first and last name
      const fullName = `${data.firstName} ${data.lastName}`.trim()

      // Create a supplier object that matches the expected format
      const supplierData = {
        name: fullName,
        contactPerson: fullName,
        email: data.email,
        phoneNumber: data.phoneNumber,
        address: data.address,
        rating: data.rating,
        status: data.status,
        // Add user-specific fields
        firstName: data.firstName,
        lastName: data.lastName,
        password: data.password,
        role: "supplier" as UserRole,
      }

      await onAdd(supplierData)
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
              <X className="w-5 h-5" />
            </button>
          </div>
          <AlertDialogDescription>Enter the details for the new supplier.</AlertDialogDescription>
        </AlertDialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full mb-4">
            <TabsTrigger value="new" className="flex-1">
              Create New User
            </TabsTrigger>
            <TabsTrigger value="existing" className="flex-1">
              Use Existing User
            </TabsTrigger>
          </TabsList>

          <TabsContent value="new">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" {...register("password")} className="input-focus input-hover" />
                {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
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
                  <Label htmlFor="rating">Rating (0-5)</Label>
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
                  {loading ? "Adding..." : "Add Supplier"}
                </Button>
              </AlertDialogFooter>
            </form>
          </TabsContent>

          <TabsContent value="existing">
            <div className="p-4 text-center">
              <p className="text-muted-foreground">
                This feature will be implemented soon. It will allow you to convert an existing user to a supplier.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </AlertDialogContent>
    </AlertDialog>
  )
}

