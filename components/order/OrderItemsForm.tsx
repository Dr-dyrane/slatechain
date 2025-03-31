"use client"

import { useFieldArray, useForm } from "react-hook-form"
import { useEffect, useMemo, useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Trash2, Plus } from "lucide-react"
import type { InventoryItem, OrderItem } from "@/lib/types"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const orderItemSchema = z.object({
    id: z.number().optional(),
    productId: z.string().min(1, "Product ID is required"),
    quantity: z.number().min(1, "Quantity must be at least 1"),
    price: z.number().min(0, "Price must be non-negative"),
})

const orderItemsSchema = z.object({
    items: z.array(orderItemSchema).min(1, "At least one item is required"),
})

type OrderItemsFormValues = z.infer<typeof orderItemsSchema>

interface OrderItemsFormProps {
    items: OrderItem[]
    onItemsChange: (items: OrderItem[]) => void
    inventoryItems: InventoryItem[];
    inventoryLoading: boolean;
}

export function OrderItemsForm({ items, onItemsChange, inventoryItems, inventoryLoading }: OrderItemsFormProps) {

    const {
        control,
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        watch,
    } = useForm<OrderItemsFormValues>({
        resolver: zodResolver(orderItemsSchema),
        defaultValues: { items },
    })

    const { fields, append, remove, update } = useFieldArray({
        control,
        name: "items",
    })



    const handleAddItem = () => {
        append({ productId: "", quantity: 1, price: 0 })
    }

    const handleInventoryItemChange = (index: number, inventoryItemId: string) => {
        // Find the selected inventory item
        const selectedItem = inventoryItems.find((item) => item.id === inventoryItemId)

        if (!selectedItem || inventoryLoading) {
            return; // Handle cases where no item is selected or inventory is still loading
        }

        if (selectedItem) {
            // Update the form with the inventory item's ID and price
            setValue(`items.${index}.productId`, inventoryItemId)
            setValue(`items.${index}.price`, selectedItem.price || 0)

            // Update the parent component
            const updatedItems = [...fields]
            updatedItems[index] = {
                ...updatedItems[index],
                productId: inventoryItemId,
                price: selectedItem.price || 0,
            }
            update(index, updatedItems[index])
            onItemsChange(updatedItems as OrderItem[])
        }
    }

    const handleQuantityChange = (index: number, quantity: number) => {
        setValue(`items.${index}.quantity`, quantity)

        // Update the parent component
        const updatedItems = [...fields]
        updatedItems[index] = { ...updatedItems[index], quantity }
        update(index, updatedItems[index])
        onItemsChange(updatedItems as OrderItem[])
    }

    return (
        <div className="space-y-4">
            {fields?.map((field, index) => (
                <Card key={field.id}>
                    <CardHeader>
                        <CardTitle className="text-sm font-medium">Item {index + 1}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-5 gap-4">
                            <div className="col-span-3">
                                <Label htmlFor={`items.${index}.productId`}>Product</Label>
                                <Select onValueChange={(value) => handleInventoryItemChange(index, value)} value={field.productId}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select a product" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {inventoryLoading ? (
                                            <SelectItem value="loading" disabled>
                                                Loading products...
                                            </SelectItem>
                                        ) : inventoryItems?.length === 0 ? (
                                            <SelectItem value="none" disabled>
                                                No products available
                                            </SelectItem>
                                        ) : (
                                            inventoryItems?.map((item) => (
                                                <SelectItem key={item.id} value={item.id as string}>
                                                    {item.name} ({item.sku})
                                                </SelectItem>
                                            ))
                                        )}
                                    </SelectContent>
                                </Select>
                                <input type="hidden" {...register(`items.${index}.productId` as const)} />
                                {errors.items?.[index]?.productId && (
                                    <p className="text-sm text-red-500">{errors.items[index]?.productId?.message}</p>
                                )}
                            </div>
                            <div className="col-span-1">
                                <Label htmlFor={`items.${index}.quantity`}>Quantity</Label>
                                <Input
                                    type="number"
                                    {...register(`items.${index}.quantity` as const, { valueAsNumber: true })}
                                    onChange={(e) => handleQuantityChange(index, Number(e.target.value))}
                                />
                                {errors.items?.[index]?.quantity && (
                                    <p className="text-sm text-red-500">{errors.items[index]?.quantity?.message}</p>
                                )}
                            </div>
                            <div className="col-span-1">
                                <Label htmlFor={`items.${index}.price`}>Price</Label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    {...register(`items.${index}.price` as const, { valueAsNumber: true })}
                                    readOnly
                                    className="bg-muted"
                                />
                                {errors.items?.[index]?.price && (
                                    <p className="text-sm text-red-500">{errors.items[index]?.price?.message}</p>
                                )}
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button type="button" onClick={() => remove(index)} variant="destructive" size="sm">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Remove Item
                        </Button>
                    </CardFooter>
                </Card>
            ))}
            <Button type="button" onClick={handleAddItem} className="mt-2">
                <Plus className="mr-2 h-4 w-4" />
                Add Item
            </Button>
        </div>
    )
}

