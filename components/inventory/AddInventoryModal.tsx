// src/components/inventory/AddInventoryModal.tsx
"use client"

import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import type { AppDispatch, RootState } from "@/lib/store"
import { useDispatch, useSelector } from "react-redux"
import { type InventoryItem, UserRole } from "@/lib/types"
import { toast } from "sonner"
import { useEffect } from "react"
import { addInventoryItem } from "@/lib/slices/inventorySlice"
import { X } from "lucide-react"

const addInventorySchema = z.object({
    name: z.string().min(1, "Name is required"),
    sku: z.string().min(1, "SKU is required"),
    quantity: z.number({ invalid_type_error: "Quantity must be a number" }).min(0, "Quantity must be a positive number"),
    minAmount: z
        .number({ invalid_type_error: "Minimum Amount must be a number" })
        .min(0, "Minimum Amount must be a positive number"),
    replenishmentAmount: z
        .number({ invalid_type_error: "Replenishment Amount must be a number" })
        .min(0, "Replenishment Amount must be a positive number"),
    location: z.string().min(1, "Location is required"),
    price: z.number({ invalid_type_error: "Price must be a number" }).min(0, "Price must be a positive number"),
    unitCost: z
        .number({ invalid_type_error: "Unit Cost must be a number" })
        .min(0, "Unit Cost must be a positive number"),
    category: z.string().min(1, "Category is required"),
    supplierId: z.string().min(1, "Supplier ID is required"),
    warehouseId: z.string().min(1, "Warehouse ID is required"),
    zoneId: z.string().min(1, "Zone ID is required"),
    description: z.string().optional(),
    lotNumber: z.string().optional(),
    serialNumber: z.string().optional(),
    expirationDate: z.string().optional(),
})

type AddInventoryFormValues = z.infer<typeof addInventorySchema>

interface AddInventoryModalProps {
    open: boolean
    onClose: () => void
}
export function AddInventoryModal({ open, onClose }: AddInventoryModalProps) {
    const dispatch = useDispatch<AppDispatch>()
    const { loading, warehouses } = useSelector((state: RootState) => state.inventory)
    const { user } = useSelector((state: RootState) => state.auth)

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isValid },
    } = useForm<AddInventoryFormValues>({
        resolver: zodResolver(addInventorySchema),
        defaultValues: {
            supplierId: user?.id || "user-123",
            warehouseId: warehouses?.[0]?.id || "warehouse-1",
            zoneId: warehouses?.[0]?.zones?.[0]?.id || "zone-1",
            replenishmentAmount: 10,
            unitCost: 0,
            description: "",
            lotNumber: "",
            serialNumber: "",
        },
    })

    useEffect(() => {
        if (user) {
            reset({
                supplierId: user?.id || "user-123",
                warehouseId: warehouses?.[0]?.id || "warehouse-1",
                zoneId: warehouses?.[0]?.zones?.[0]?.id || "zone-1",
                replenishmentAmount: 10,
                unitCost: 0,
                description: "",
                lotNumber: "",
                serialNumber: "",
            } as any)
        }
    }, [reset, user, warehouses])

    const onSubmit = async (data: AddInventoryFormValues) => {
        try {
            await dispatch(addInventoryItem(data as Omit<InventoryItem, "id">)).unwrap()
            toast.success("New inventory item created successfully")
            onClose()
            reset()
        } catch (error: any) {
            toast.error(error || "There was an error creating inventory item, please try again later")
        }
    }

    const isAdmin = user?.role === UserRole.ADMIN

    return (
        <AlertDialog open={open} onOpenChange={onClose}>
            <AlertDialogContent className="w-full max-w-md rounded-2xl sm:max-w-lg mx-auto max-h-[80vh] overflow-y-auto">
                <AlertDialogHeader>
                    <div className="flex justify-center items-center relative">
                        <AlertDialogTitle>Add New Inventory Item</AlertDialogTitle>
                        <button
                            onClick={onClose}
                            className="text-gray-500 hover:text-gray-700 absolute -top-4 sm:-top-1 -right-4 p-2 bg-muted rounded-full"
                        >
                            <X className="w-5 h-5 " />
                        </button>
                    </div>
                    <AlertDialogDescription>Please provide details of inventory to be created.</AlertDialogDescription>
                </AlertDialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input id="name" placeholder="Name" {...register("name")} className="input-focus input-hover" />
                        {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="sku">SKU</Label>
                        <Input id="sku" placeholder="SKU" {...register("sku")} className="input-focus input-hover" />
                        {errors.sku && <p className="text-sm text-red-500">{errors.sku.message}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="quantity">Quantity</Label>
                        <Input
                            id="quantity"
                            type="number"
                            placeholder="Quantity"
                            {...register("quantity", { valueAsNumber: true })}
                            className="input-focus input-hover"
                        />
                        {errors.quantity && <p className="text-sm text-red-500">{errors.quantity.message}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="minAmount">Min Stock</Label>
                        <Input
                            id="minAmount"
                            type="number"
                            placeholder="Minimum Stock Amount"
                            {...register("minAmount", { valueAsNumber: true })}
                            className="input-focus input-hover"
                        />
                        {errors.minAmount && <p className="text-sm text-red-500">{errors.minAmount.message}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="replenishmentAmount">Replenishment Amount</Label>
                        <Input
                            id="replenishmentAmount"
                            type="number"
                            placeholder="Replenishment Amount"
                            {...register("replenishmentAmount", { valueAsNumber: true })}
                            className="input-focus input-hover"
                        />
                        {errors.replenishmentAmount && <p className="text-sm text-red-500">{errors.replenishmentAmount.message}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="location">Location</Label>
                        <Input id="location" placeholder="Location" {...register("location")} className="input-focus input-hover" />
                        {errors.location && <p className="text-sm text-red-500">{errors.location.message}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="price">Price</Label>
                        <Input
                            id="price"
                            type="number"
                            placeholder="Price"
                            {...register("price", { valueAsNumber: true })}
                            className="input-focus input-hover"
                        />
                        {errors.price && <p className="text-sm text-red-500">{errors.price.message}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="unitCost">Unit Cost</Label>
                        <Input
                            id="unitCost"
                            type="number"
                            placeholder="Unit Cost"
                            {...register("unitCost", { valueAsNumber: true })}
                            className="input-focus input-hover"
                        />
                        {errors.unitCost && <p className="text-sm text-red-500">{errors.unitCost.message}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="category">Category</Label>
                        <Input id="category" placeholder="Category" {...register("category")} className="input-focus input-hover" />
                        {errors.category && <p className="text-sm text-red-500">{errors.category.message}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="warehouseId">Warehouse ID</Label>
                        <Input
                            id="warehouseId"
                            placeholder="Warehouse ID"
                            {...register("warehouseId")}
                            className="input-focus input-hover"
                        />
                        {errors.warehouseId && <p className="text-sm text-red-500">{errors.warehouseId.message}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="zoneId">Zone ID</Label>
                        <Input id="zoneId" placeholder="Zone ID" {...register("zoneId")} className="input-focus input-hover" />
                        {errors.zoneId && <p className="text-sm text-red-500">{errors.zoneId.message}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="description">Description (Optional)</Label>
                        <Input
                            id="description"
                            placeholder="Description"
                            {...register("description")}
                            className="input-focus input-hover"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="lotNumber">Lot Number (Optional)</Label>
                        <Input
                            id="lotNumber"
                            placeholder="Lot Number"
                            {...register("lotNumber")}
                            className="input-focus input-hover"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="serialNumber">Serial Number (Optional)</Label>
                        <Input
                            id="serialNumber"
                            placeholder="Serial Number"
                            {...register("serialNumber")}
                            className="input-focus input-hover"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="expirationDate">Expiration Date (Optional)</Label>
                        <Input
                            id="expirationDate"
                            type="date"
                            {...register("expirationDate")}
                            className="input-focus input-hover"
                        />
                    </div>

                    {isAdmin && (
                        <div className="space-y-2">
                            <Label htmlFor="supplierId">Supplier Id</Label>
                            <Input
                                id="supplierId"
                                placeholder="supplierId"
                                {...register("supplierId")}
                                className="input-focus input-hover"
                            />
                            {errors.supplierId && <p className="text-sm text-red-500">{errors.supplierId.message}</p>}
                        </div>
                    )}
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Adding..." : "Add Item"}
                        </Button>
                    </AlertDialogFooter>
                </form>
            </AlertDialogContent>
        </AlertDialog>
    )
}

