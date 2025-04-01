"use client"

import { useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { createReturnRequest } from "@/lib/slices/returnSlice"
import { fetchOrders } from "@/lib/slices/orderSlice"
import type { AppDispatch, RootState } from "@/lib/store"
import { Order, ReturnReason, ReturnType } from "@/lib/types"
import { toast } from "sonner"
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
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, X } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"

interface AddReturnModalProps {
    open: boolean
    onClose: () => void
}

export function AddReturnModal({ open, onClose }: AddReturnModalProps) {
    const dispatch = useDispatch<AppDispatch>()
    const { items: orders, loading: ordersLoading } = useSelector((state: RootState) => state.orders)
    const { updateLoading } = useSelector((state: RootState) => state.returns)
    const user = useSelector((state: RootState) => state.auth.user)

    const [selectedOrderId, setSelectedOrderId] = useState<string>("")
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
    const [selectedItems, setSelectedItems] = useState<Record<string, { selected: boolean; quantity: number }>>({})
    const [returnReason, setReturnReason] = useState<ReturnReason>(ReturnReason.DAMAGED)
    const [reasonDetails, setReasonDetails] = useState<string>("")
    const [preferredReturnType, setPreferredReturnType] = useState<ReturnType>(ReturnType.REFUND)
    const [customerId, setCustomerId] = useState<string>(user?.id || "");


    // Only show delivered orders
    const deliveredOrders = orders.filter((order) => order.status === "DELIVERED")

    useEffect(() => {
        if (open && orders.length === 0) {
            dispatch(fetchOrders())
        }
    }, [open, dispatch, orders.length])

    useEffect(() => {
        if (selectedOrderId) {
            const order = orders.find((o) => o.id.toString() === selectedOrderId)
            setSelectedOrder(order || null)

            // Reset selected items when order changes
            if (order) {
                const initialSelectedItems: Record<string, { selected: boolean; quantity: number }> = {}
                order.items.forEach((item) => {
                    initialSelectedItems[item._id?.toString() || item.id?.toString() || ""] = {
                        selected: false,
                        quantity: 1,
                    }
                })
                setSelectedItems(initialSelectedItems)
            }
        } else {
            setSelectedOrder(null)
            setSelectedItems({})
        }
    }, [selectedOrderId, orders])

    const handleOrderChange = (orderId: string) => {
        setSelectedOrderId(orderId)
    }

    const handleItemSelection = (itemId: string, selected: boolean) => {
        setSelectedItems((prev) => ({
            ...prev,
            [itemId]: {
                ...prev[itemId],
                selected,
            },
        }))
    }

    const handleQuantityChange = (itemId: string, quantity: number) => {
        setSelectedItems((prev) => ({
            ...prev,
            [itemId]: {
                ...prev[itemId],
                quantity: Math.max(1, Math.min(quantity, getMaxQuantity(itemId))),
            },
        }))
    }

    const getMaxQuantity = (itemId: string): number => {
        if (!selectedOrder) return 1
        const item = selectedOrder.items.find((i) => (i._id?.toString() || i.id?.toString()) === itemId)
        return item?.quantity || 1
    }

    const handleSubmit = async () => {
        if (!selectedOrder) {
            toast.error("Please select an order");
            return;
        }

        const selectedItemsArray = Object.entries(selectedItems)
            .filter(([_, value]) => value.selected)
            .map(([itemId, value]) => {
                const orderItem = selectedOrder.items.find(
                    (item) => (item._id?.toString() || item.id?.toString()) === itemId
                );

                return {
                    orderItemId: itemId,
                    quantity: value.quantity,
                    productId: orderItem?.productId || "",
                };
            });

        if (selectedItemsArray.length === 0) {
            toast.error("Please select at least one item to return");
            return;
        }

        try {
            // Generate the RTN field
            const count = selectedOrder.items.length;
            const returnReference = `RTN${String(count + 1).padStart(6, "0")}`;

            // Create a complete return request payload
            const returnData = {
                returnRequestNumber: returnReference,  // Added the RTN field
                orderId: selectedOrder.id?.toString() || "",
                customerId,
                items: selectedItemsArray,
                returnReason,
                reasonDetails: returnReason === "Other" ? reasonDetails : "",
                preferredReturnType,
                requestDate: new Date().toISOString(),
                proofImages: [],
            };

            // Log the payload before dispatching
            console.log("Return Request Payload:", returnData);

            await dispatch(createReturnRequest(returnData)).unwrap();
            toast.success("Return request submitted successfully");
            onClose();
        } catch (error) {
            console.error("Error creating return request:", error);
            toast.error("Failed to submit return request");
        }
    };



    return (
        <AlertDialog open={open} onOpenChange={onClose}>
            <AlertDialogContent className="w-full max-w-md rounded-2xl sm:max-w-lg mx-auto max-h-[80vh] overflow-y-auto">
                <AlertDialogHeader>
                    <div className="flex justify-center items-center relative">
                        <AlertDialogTitle>Request Return</AlertDialogTitle>
                        <button
                            onClick={onClose}
                            className="text-gray-500 hover:text-gray-700 absolute -top-4 sm:-top-1 -right-4 p-2 bg-muted rounded-full"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    <AlertDialogDescription>Select items from a delivered order that you wish to return.</AlertDialogDescription>
                </AlertDialogHeader>

                <div className="space-y-2">
                    <Label htmlFor="customerId">Customer ID</Label>
                    <Input
                        id="customerId"
                        placeholder="Enter customer ID"
                        value={customerId}
                        onChange={(e) => setCustomerId(e.target.value)}
                        className="w-full"
                    />
                </div>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="order">Select Order</Label>
                        <Select value={selectedOrderId} onValueChange={handleOrderChange}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select an order" />
                            </SelectTrigger>
                            <SelectContent>
                                {deliveredOrders.length === 0 ? (
                                    <SelectItem value="none" disabled>
                                        No delivered orders found
                                    </SelectItem>
                                ) : (
                                    deliveredOrders.map((order) => (
                                        <SelectItem key={order.id} value={order.id.toString()}>
                                            {order.orderNumber} - ${order.totalAmount.toFixed(2)}
                                        </SelectItem>
                                    ))
                                )}
                            </SelectContent>
                        </Select>
                    </div>

                    {selectedOrder && (
                        <>
                            <div className="space-y-2">
                                <Label>Select Items to Return</Label>
                                <div className="border rounded-md p-3 space-y-3 max-h-40 overflow-y-auto">
                                    {selectedOrder.items.map((item) => {
                                        const itemId = item._id?.toString() || item.id?.toString() || ""
                                        return (
                                            <div key={itemId} className="flex flex-wrap items-center gap-4 justify-between pb-2">
                                                <div className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id={`item-${itemId}`}
                                                        checked={selectedItems[itemId]?.selected || false}
                                                        onCheckedChange={(checked) => handleItemSelection(itemId, checked === true)}
                                                    />
                                                    <Label htmlFor={`item-${itemId}`} className="cursor-pointer">
                                                        {item.productId} (ID: {itemId}) - Qty: {item.quantity}
                                                    </Label>
                                                </div>
                                                {selectedItems[itemId]?.selected && (
                                                    <div className="flex items-center space-x-2">
                                                        <Label htmlFor={`qty-${itemId}`} className="text-sm">
                                                            Return Qty:
                                                        </Label>
                                                        <Input
                                                            id={`qty-${itemId}`}
                                                            type="number"
                                                            min={1}
                                                            max={getMaxQuantity(itemId)}
                                                            value={selectedItems[itemId]?.quantity || 1}
                                                            onChange={(e) => handleQuantityChange(itemId, Number.parseInt(e.target.value))}
                                                            className="w-16 h-8 text-sm"
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="returnReason">Return Reason</Label>
                                <Select value={returnReason} onValueChange={(value) => setReturnReason(value as ReturnReason)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a reason" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Damaged">Damaged</SelectItem>
                                        <SelectItem value="WrongItem">Wrong Item</SelectItem>
                                        <SelectItem value="DoesNotFit">Does Not Fit</SelectItem>
                                        <SelectItem value="ChangedMind">Changed Mind</SelectItem>
                                        <SelectItem value="NotAsDescribed">Not As Described</SelectItem>
                                        <SelectItem value="Defective">Defective</SelectItem>
                                        <SelectItem value="ArrivedLate">Arrived Late</SelectItem>
                                        <SelectItem value="Other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {returnReason === "Other" && (
                                <div className="space-y-2">
                                    <Label htmlFor="reasonDetails">Please explain</Label>
                                    <Textarea
                                        id="reasonDetails"
                                        placeholder="Please provide details about your return reason"
                                        value={reasonDetails}
                                        onChange={(e) => setReasonDetails(e.target.value)}
                                    />
                                </div>
                            )}


                            <div className="space-y-2">
                                <Label htmlFor="preferredReturnType">Preferred Return Type</Label>
                                <Select
                                    value={preferredReturnType}
                                    onValueChange={(value) => setPreferredReturnType(value as ReturnType)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select return type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Refund">Refund</SelectItem>
                                        <SelectItem value="Replacement">Replacement</SelectItem>
                                        <SelectItem value="StoreCredit">Store Credit</SelectItem>
                                        <SelectItem value="Exchange">Exchange</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </>
                    )}
                </div>

                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <Button onClick={handleSubmit} disabled={updateLoading || !selectedOrder}>
                        {updateLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        {updateLoading ? "Submitting..." : "Submit Return Request"}
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}

