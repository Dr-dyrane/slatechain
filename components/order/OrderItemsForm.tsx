import { useFieldArray, useForm } from "react-hook-form"
import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Trash2, Plus } from "lucide-react"
import type { OrderItem } from "@/lib/types"

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
}

export function OrderItemsForm({ items, onItemsChange }: OrderItemsFormProps) {
    const {
        control,
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<OrderItemsFormValues>({
        resolver: zodResolver(orderItemsSchema),
        defaultValues: { items },
    })

    const [debouncedUpdates, setDebouncedUpdates] = useState<Record<number, NodeJS.Timeout | null>>({})
    const debouncedHandleUpdate = (index: number, data: Partial<OrderItem>) => {
        // Clear the previous timeout for this field
        if (debouncedUpdates[index]) {
            clearTimeout(debouncedUpdates[index]!)
        }

        // Set a new timeout
        const timeout = setTimeout(() => {
            handleUpdateItem(index, data)
        }, 1000) // Adjust delay as needed

        setDebouncedUpdates((prev) => ({ ...prev, [index]: timeout }))
    }

    const { fields, append, remove, update } = useFieldArray({
        control,
        name: "items",
    })

    const handleAddItem = () => {
        append({ productId: "", quantity: 1, price: 0 })
    }

    const handleUpdateItem = (index: number, data: Partial<OrderItem>) => {
        const updatedItems = [...fields]
        updatedItems[index] = { ...updatedItems[index], ...data }
        update(index, updatedItems[index])
        onItemsChange(updatedItems as OrderItem[])
    }

    return (
        <div className="space-y-4">
            {fields.map((field, index) => (
                <Card key={field.id}>
                    <CardHeader>
                        <CardTitle className="text-sm font-medium">Item {index + 1}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <Label htmlFor={`items.${index}.productId`}>Product ID</Label>
                                <Input
                                    {...register(`items.${index}.productId` as const)}
                                    onChange={(e) => debouncedHandleUpdate(index, { productId: e.target.value })}
                                />
                                {errors.items?.[index]?.productId && (
                                    <p className="text-sm text-red-500">{errors.items[index]?.productId?.message}</p>
                                )}
                            </div>
                            <div>
                                <Label htmlFor={`items.${index}.quantity`}>Quantity</Label>
                                <Input
                                    type="number"
                                    {...register(`items.${index}.quantity` as const, { valueAsNumber: true })}
                                    onChange={(e) => debouncedHandleUpdate(index, { quantity: Number(e.target.value) })}
                                />
                                {errors.items?.[index]?.quantity && (
                                    <p className="text-sm text-red-500">{errors.items[index]?.quantity?.message}</p>
                                )}
                            </div>
                            <div>
                                <Label htmlFor={`items.${index}.price`}>Price</Label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    {...register(`items.${index}.price` as const, { valueAsNumber: true })}
                                    onChange={(e) => debouncedHandleUpdate(index, { price: Number(e.target.value) })}
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

