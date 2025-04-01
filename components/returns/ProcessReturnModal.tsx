"use client"

import { useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { updateReturnRequest, resolveReturnRequest, fetchReturnById } from "@/lib/slices/returnSlice"
import type { AppDispatch, RootState } from "@/lib/store"
import type { ReturnItem } from "@/lib/types/returns"
import { ReturnRequestStatus, ReturnType, type ReturnRequest } from "@/lib/types"
import { toast } from "sonner"
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogFooter,
    AlertDialogCancel,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, X, AlertCircle, Plus, Minus } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { fetchInventory } from "@/lib/slices/inventorySlice"

interface ProcessReturnModalProps {
    open: boolean
    onClose: () => void
    returnRequest: ReturnRequest | null
}

interface ReplacementItem {
    productId: string
    quantity: number
    price: number // Add price field
}

export function ProcessReturnModal({ open, onClose, returnRequest }: ProcessReturnModalProps) {
    const dispatch = useDispatch<AppDispatch>()
    const error = useSelector((state: RootState) => state.returns?.error)
    const inventoryItems = useSelector((state: RootState) => state.inventory?.items || [])
    const [activeTab, setActiveTab] = useState("details")
    const [loading, setLoading] = useState(false)
    const [currentReturn, setCurrentReturn] = useState<ReturnRequest | null>(null)
    const [isLoadingDetails, setIsLoadingDetails] = useState(false)
    const [isLoadingInventory, setIsLoadingInventory] = useState(false)

    // Form state
    const [status, setStatus] = useState<ReturnRequestStatus>(ReturnRequestStatus.PENDING_APPROVAL)
    const [staffComments, setStaffComments] = useState("")
    const [itemsToUpdate, setItemsToUpdate] = useState<any[]>([])

    // Resolution form state
    const [resolutionType, setResolutionType] = useState<ReturnType>(ReturnType.REFUND)
    const [resolutionNotes, setResolutionNotes] = useState("")
    const [refundAmount, setRefundAmount] = useState(0)
    const [replacementItems, setReplacementItems] = useState<ReplacementItem[]>([])
    const [selectedInventoryItem, setSelectedInventoryItem] = useState<string>("")
    const [selectedQuantity, setSelectedQuantity] = useState<number>(1)

    // Fetch detailed return data when modal opens
    useEffect(() => {
        if (open && returnRequest) {
            setCurrentReturn(returnRequest)
            setStatus(returnRequest.status)
            setStaffComments(returnRequest.staffComments || "")

            // If we need more detailed data, fetch it
            if (!returnRequest.returnItems || activeTab !== "details") {
                fetchDetailedReturnData(returnRequest._id || returnRequest.id)
            } else {
                // Initialize with what we have
                initializeFormState(returnRequest)
            }
        }
    }, [open, returnRequest])

    // Fetch inventory items when resolution type changes to Replacement
    useEffect(() => {
        if (resolutionType === "Replacement" && inventoryItems.length === 0) {
            fetchInventory()
        }
    }, [resolutionType, inventoryItems.length])

    // Initialize replacement items based on return items
    useEffect(() => {
        if (resolutionType === "Replacement" && currentReturn?.returnItems && replacementItems.length === 0) {
            // Auto-populate replacement items based on the return items
            const initialReplacements = currentReturn.returnItems.map((item: ReturnItem) => {
                const productId = typeof item.productId === "object" ? item.productId._id : item.productId
                const name = typeof item.productId === "object" ? item.productId.name : "Unknown Product"
                return {
                    productId,
                    quantity: item.quantityRequested,
                    name,
                    price: 0, // Placeholder price
                }
            })
            setReplacementItems(initialReplacements)
        }
    }, [resolutionType, currentReturn?.returnItems, replacementItems.length])

    const fetchInventoryData = async () => {
        setIsLoadingInventory(true)
        try {
            await dispatch(fetchInventory()).unwrap()
        } catch (error) {
            console.error("Error fetching inventory items:", error)
            toast.error("Failed to load inventory items")
        } finally {
            setIsLoadingInventory(false)
        }
    }

    const fetchDetailedReturnData = async (returnId: string) => {
        setIsLoadingDetails(true)
        try {
            const detailedReturn = await dispatch(fetchReturnById(returnId)).unwrap()
            setCurrentReturn(detailedReturn)
            initializeFormState(detailedReturn)
        } catch (error) {
            console.error("Error fetching detailed return data:", error)
            toast.error("Failed to load return details")
        } finally {
            setIsLoadingDetails(false)
        }
    }

    const initializeFormState = (returnData: ReturnRequest) => {
        setStatus(returnData.status)
        setStaffComments(returnData.staffComments || "")

        // Initialize items to update
        if (returnData.returnItems && Array.isArray(returnData.returnItems)) {
            setItemsToUpdate(
                returnData.returnItems.map((item) => ({
                    returnItemId: item._id || item.id,
                    quantityReceived: item.quantityReceived || 0,
                    itemCondition: item.itemCondition || undefined,
                    disposition: item.disposition || undefined,
                    returnTrackingNumber: item.returnTrackingNumber || "",
                    shippingLabelUrl: item.shippingLabelUrl || "",
                })),
            )
        } else {
            setItemsToUpdate([])
        }

        // Initialize resolution form if there's a resolution
        if (returnData.resolution) {
            setResolutionType(returnData.resolution.resolutionType)
            setResolutionNotes(returnData.resolution.notes || "")
            setRefundAmount(returnData.resolution.refundAmount || 0)
        }
    }

    const handleItemUpdate = (index: number, field: string, value: any) => {
        const updatedItems = [...itemsToUpdate]
        updatedItems[index] = {
            ...updatedItems[index],
            [field]: value,
        }
        setItemsToUpdate(updatedItems)
    }

    const handleUpdateReturn = async () => {
        if (!currentReturn) return

        setLoading(true)
        try {
            const updateData = {
                status,
                staffComments,
                itemsToUpdate,
            }

            console.log("Updating return with data:", updateData)
            await dispatch(updateReturnRequest({ id: currentReturn._id || currentReturn.id, updateData })).unwrap()
            toast.success("Return request updated successfully")

            // Refresh the return data
            const updatedReturn = await dispatch(fetchReturnById(currentReturn._id || currentReturn.id)).unwrap()
            setCurrentReturn(updatedReturn)
        } catch (error) {
            console.error("Error updating return:", error)
            toast.error("Failed to update return request")
        } finally {
            setLoading(false)
        }
    }

    const handleResolveReturn = async () => {
        if (!currentReturn) return

        if (resolutionType === "Refund" && (!refundAmount || refundAmount <= 0)) {
            toast.error("Please enter a valid refund amount")
            return
        }

        if (resolutionType === "Replacement" && (!replacementItems || replacementItems.length === 0)) {
            toast.error("Please add at least one replacement item")
            return
        }

        setLoading(true)
        try {
            // Format replacement items to include all required fields for creating an order
            const formattedReplacementItems =
                resolutionType === "Replacement"
                    ? replacementItems.map((item) => {
                        // Find the inventory item to get its price
                        const inventoryItem = inventoryItems.find((invItem) => invItem.id === item.productId)
                        return {
                            productId: item.productId,
                            quantity: item.quantity,
                            price: inventoryItem?.price || 0, // Get price from inventory
                        }
                    })
                    : undefined

            const resolutionData = {
                resolutionType,
                notes: resolutionNotes,
                refundAmount: resolutionType === "Refund" ? refundAmount : undefined,
                replacementItems: formattedReplacementItems,
            }

            console.log("Resolving return with data:", resolutionData)
            await dispatch(resolveReturnRequest({ id: currentReturn._id || currentReturn.id, resolutionData })).unwrap()
            toast.success("Return request resolved successfully")

            // Refresh the return data
            const updatedReturn = await dispatch(fetchReturnById(currentReturn._id || currentReturn.id)).unwrap()
            setCurrentReturn(updatedReturn)

            // Switch to details tab to show the resolution
            setActiveTab("details")
        } catch (error) {
            console.error("Error resolving return:", error)
            toast.error("Failed to resolve return request")
        } finally {
            setLoading(false)
        }
    }

    const addReplacementItem = () => {
        if (!selectedInventoryItem) {
            toast.error("Please select a product")
            return
        }

        if (selectedQuantity <= 0) {
            toast.error("Quantity must be greater than 0")
            return
        }

        // Find the selected inventory item to get its name
        const inventoryItem = inventoryItems.find((item) => item.id === selectedInventoryItem)

        setReplacementItems([
            ...replacementItems,
            {
                productId: selectedInventoryItem,
                quantity: selectedQuantity,
                price: inventoryItem?.price || 0,
            },
        ])

        // Reset selection
        setSelectedInventoryItem("")
        setSelectedQuantity(1)
    }

    const removeReplacementItem = (index: number) => {
        const updatedItems = [...replacementItems]
        updatedItems.splice(index, 1)
        setReplacementItems(updatedItems)
    }

    const updateReplacementItemQuantity = (index: number, quantity: number) => {
        if (quantity <= 0) return

        const updatedItems = [...replacementItems]
        updatedItems[index] = {
            ...updatedItems[index],
            quantity,
        }
        setReplacementItems(updatedItems)
    }

    const formatDate = (dateString?: string) => {
        if (!dateString) return "N/A"
        return new Date(dateString).toLocaleDateString() + " " + new Date(dateString).toLocaleTimeString()
    }

    if (!currentReturn) {
        return null
    }

    // Handle nested objects from API response
    const orderNumber =
        currentReturn.orderId && typeof currentReturn.orderId === "object"
            ? currentReturn.orderId.orderNumber
            : currentReturn.order?.orderNumber || currentReturn.orderId

    const customerName =
        currentReturn.customerId && typeof currentReturn.customerId === "object"
            ? currentReturn.customerId.email
            : currentReturn.customer?.name || "customer"

    const canResolve = ["Approved", "ItemsReceived", "Processing"].includes(currentReturn.status)
    const isResolved = currentReturn.status === "Completed" || !!currentReturn.resolution

    return (
        <AlertDialog open={open} onOpenChange={onClose}>
            <AlertDialogContent
                id="return-process-modal"
                aria-describedby="return-process-modal"
                className="w-full max-w-4xl rounded-2xl mx-auto max-h-[80vh] overflow-y-auto"
            >
                <AlertDialogHeader>
                    <div className="flex justify-between items-center">
                        <AlertDialogTitle>Process Return #{currentReturn.returnRequestNumber}</AlertDialogTitle>
                        <button onClick={onClose} className="text-gray-500 hover:text-gray-700 p-2 bg-muted rounded-full">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </AlertDialogHeader>

                {error && (
                    <Alert variant="destructive" className="mb-4">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                {isLoadingDetails && (
                    <div className="flex justify-center items-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <span className="ml-2">Loading return details...</span>
                    </div>
                )}

                {!isLoadingDetails && (
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="grid gap-2 w-full grid-cols-2 sm:grid-cols-3 mb-2 sm:mb-0">
                            <TabsTrigger value="details">Return Details</TabsTrigger>
                            <TabsTrigger value="process" disabled={isResolved}>
                                Process Items
                            </TabsTrigger>
                            <TabsTrigger className="hidden sm:flex" value="resolve" disabled={!canResolve || isResolved}>
                                Resolve
                            </TabsTrigger>
                        </TabsList>
                        <TabsList className="sm:hidden w-full">
                            <TabsTrigger value="resolve" disabled={!canResolve || isResolved}>
                                Resolve
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="details" className="mt-4 space-y-4">
                            {/* Return Details View */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm font-medium">Status</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <Badge className={`bg-${currentReturn.status === "Completed" ? "green" : "blue"}-500 text-white`}>
                                            {currentReturn.status}
                                        </Badge>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm font-medium">Order</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p>{orderNumber}</p>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm font-medium">Customer</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p>{customerName}</p>
                                    </CardContent>
                                </Card>
                            </div>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Return Details</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <h4 className="text-sm font-medium mb-1">Return Reason</h4>
                                            <p>{currentReturn.returnReason}</p>
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-medium mb-1">Preferred Return Type</h4>
                                            <p>{currentReturn.preferredReturnType}</p>
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-medium mb-1">Request Date</h4>
                                            <p>{formatDate(currentReturn.requestDate || currentReturn.createdAt)}</p>
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-medium mb-1">Last Updated</h4>
                                            <p>{formatDate(currentReturn.updatedAt)}</p>
                                        </div>
                                    </div>

                                    {currentReturn.reasonDetails && (
                                        <div>
                                            <h4 className="text-sm font-medium mb-1">Additional Details</h4>
                                            <p className="text-sm">{currentReturn.reasonDetails}</p>
                                        </div>
                                    )}

                                    {currentReturn.staffComments && (
                                        <div>
                                            <h4 className="text-sm font-medium mb-1">Staff Comments</h4>
                                            <p className="text-sm">{currentReturn.staffComments}</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Return Items */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Return Items</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid gap-4 sm:hidden">
                                        {currentReturn.returnItems?.map((item: ReturnItem, index: number) => {
                                            const productName =
                                                item.productId && typeof item.productId === "object" ? item.productId.name : "Unknown Product"

                                            return (
                                                <div key={index} className="p-4 rounded-2xl shadow-md border">
                                                    <h3 className="text-lg font-semibold mb-2">{productName}</h3>
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-sm ">Requested Qty:</span>
                                                        <span className="text-sm font-medium">{item.quantityRequested}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-sm ">Received Qty:</span>
                                                        <span className="text-sm font-medium">{item.quantityReceived || "Pending"}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-sm ">Condition:</span>
                                                        <span className="text-sm font-medium">{item.itemCondition || "Pending"}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-sm ">Disposition:</span>
                                                        <span className="text-sm font-medium">{item.disposition || "Pending"}</span>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>

                                    {/* Table for larger screens */}
                                    <div className="hidden sm:block overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="border-b">
                                                    <th className="text-left py-2">Product</th>
                                                    <th className="text-center py-2">Requested Qty</th>
                                                    <th className="text-center py-2">Received Qty</th>
                                                    <th className="text-center py-2">Condition</th>
                                                    <th className="text-center py-2">Disposition</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {currentReturn.returnItems?.map((item: ReturnItem, index: number) => {
                                                    const productName =
                                                        item.productId && typeof item.productId === "object"
                                                            ? item.productId.name
                                                            : "Unknown Product"

                                                    return (
                                                        <tr key={index} className="border-b">
                                                            <td className="py-2">{productName}</td>
                                                            <td className="text-center py-2">{item.quantityRequested}</td>
                                                            <td className="text-center py-2">{item.quantityReceived || "Pending"}</td>
                                                            <td className="text-center py-2">{item.itemCondition || "Pending"}</td>
                                                            <td className="text-center py-2">{item.disposition || "Pending"}</td>
                                                        </tr>
                                                    )
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Resolution Details (if available) */}
                            {currentReturn.resolution && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Resolution</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div>
                                                <h4 className="text-sm font-medium mb-1">Resolution Type</h4>
                                                <p>{currentReturn.resolution.resolutionType}</p>
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-medium mb-1">Status</h4>
                                                <Badge
                                                    className={`bg-${currentReturn.resolution.status === "Completed" ? "green" : "blue"}-500 text-white`}
                                                >
                                                    {currentReturn.resolution.status}
                                                </Badge>
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-medium mb-1">Resolution Date</h4>
                                                <p>{formatDate(currentReturn.resolution.resolutionDate)}</p>
                                            </div>
                                        </div>

                                        {currentReturn.resolution.notes && (
                                            <div>
                                                <h4 className="text-sm font-medium mb-1">Resolution Notes</h4>
                                                <p className="text-sm">{currentReturn.resolution.notes}</p>
                                            </div>
                                        )}

                                        {currentReturn.resolution.refundAmount && (
                                            <div>
                                                <h4 className="text-sm font-medium mb-1">Refund Amount</h4>
                                                <p>${(currentReturn?.resolution?.refundAmount ?? 0).toFixed(2)}</p>
                                            </div>
                                        )}

                                        {currentReturn.resolution.replacementOrderId && (
                                            <div>
                                                <h4 className="text-sm font-medium mb-1">Replacement Order</h4>
                                                <p>{currentReturn.resolution.replacementOrderId}</p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            )}
                        </TabsContent>

                        <TabsContent value="process" className="mt-4 space-y-4">
                            {/* Process Items Form */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Update Return Status</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="status">Status</Label>
                                            <Select value={status} onValueChange={(value) => setStatus(value as ReturnRequestStatus)}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select status" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="PendingApproval">Pending Approval</SelectItem>
                                                    <SelectItem value="Approved">Approved</SelectItem>
                                                    <SelectItem value="Rejected">Rejected</SelectItem>
                                                    <SelectItem value="ItemsReceived">Items Received</SelectItem>
                                                    <SelectItem value="Processing">Processing</SelectItem>
                                                    <SelectItem value="ResolutionPending">Resolution Pending</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="staffComments">Staff Comments</Label>
                                            <Textarea
                                                id="staffComments"
                                                placeholder="Add internal notes about this return"
                                                value={staffComments}
                                                onChange={(e) => setStaffComments(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Process Return Items</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {currentReturn.returnItems?.map((item: ReturnItem, index: number) => {
                                            const itemToUpdate = itemsToUpdate[index]
                                            // Handle nested product object
                                            const productName =
                                                item.productId && typeof item.productId === "object" ? item.productId.name : "Unknown Product"

                                            return (
                                                <div key={index} className="border rounded-md p-4 space-y-3">
                                                    <div className="flex justify-between items-center">
                                                        <h4 className="font-medium">{productName}</h4>
                                                        <p>Requested: {item.quantityRequested}</p>
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                        <div className="space-y-2">
                                                            <Label htmlFor={`quantityReceived-${index}`}>Quantity Received</Label>
                                                            <Input
                                                                id={`quantityReceived-${index}`}
                                                                type="number"
                                                                min={0}
                                                                max={item.quantityRequested}
                                                                value={itemToUpdate.quantityReceived}
                                                                onChange={(e) =>
                                                                    handleItemUpdate(index, "quantityReceived", Number.parseInt(e.target.value))
                                                                }
                                                            />
                                                        </div>

                                                        <div className="space-y-2">
                                                            <Label htmlFor={`condition-${index}`}>Item Condition</Label>
                                                            <Select
                                                                value={itemToUpdate.itemCondition || ""}
                                                                onValueChange={(value) => handleItemUpdate(index, "itemCondition", value)}
                                                            >
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="Select condition" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem value="NotAssessed">Not Assessed</SelectItem>
                                                                    <SelectItem value="NewInBox">New In Box</SelectItem>
                                                                    <SelectItem value="LikeNewOpenBox">Like New (Open Box)</SelectItem>
                                                                    <SelectItem value="UsedGood">Used - Good</SelectItem>
                                                                    <SelectItem value="UsedFair">Used - Fair</SelectItem>
                                                                    <SelectItem value="DamagedRepairable">Damaged - Repairable</SelectItem>
                                                                    <SelectItem value="DamagedBeyondRepair">Damaged - Beyond Repair</SelectItem>
                                                                    <SelectItem value="MissingParts">Missing Parts</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        </div>

                                                        <div className="space-y-2">
                                                            <Label htmlFor={`disposition-${index}`}>Disposition</Label>
                                                            <Select
                                                                value={itemToUpdate.disposition || ""}
                                                                onValueChange={(value) => handleItemUpdate(index, "disposition", value)}
                                                            >
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="Select disposition" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem value="Restock">Restock</SelectItem>
                                                                    <SelectItem value="ReturnToSupplier">Return to Supplier</SelectItem>
                                                                    <SelectItem value="Refurbish">Refurbish</SelectItem>
                                                                    <SelectItem value="Dispose">Dispose</SelectItem>
                                                                    <SelectItem value="Quarantine">Quarantine</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div className="space-y-2">
                                                            <Label htmlFor={`tracking-${index}`}>Return Tracking Number</Label>
                                                            <Input
                                                                id={`tracking-${index}`}
                                                                value={itemToUpdate.returnTrackingNumber}
                                                                onChange={(e) => handleItemUpdate(index, "returnTrackingNumber", e.target.value)}
                                                                placeholder="Optional tracking number"
                                                            />
                                                        </div>

                                                        <div className="space-y-2">
                                                            <Label htmlFor={`label-${index}`}>Shipping Label URL</Label>
                                                            <Input
                                                                id={`label-${index}`}
                                                                value={itemToUpdate.shippingLabelUrl}
                                                                onChange={(e) => handleItemUpdate(index, "shippingLabelUrl", e.target.value)}
                                                                placeholder="Optional shipping label URL"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="flex justify-end">
                                <Button onClick={handleUpdateReturn} disabled={loading}>
                                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                    {loading ? "Updating..." : "Update Return"}
                                </Button>
                            </div>
                        </TabsContent>

                        <TabsContent value="resolve" className="mt-4 space-y-4">
                            {/* Resolve Return Form */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Resolve Return</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="resolutionType">Resolution Type</Label>
                                            <Select value={resolutionType} onValueChange={(value) => setResolutionType(value as ReturnType)}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select resolution type" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Refund">Refund</SelectItem>
                                                    <SelectItem value="Replacement">Replacement</SelectItem>
                                                    <SelectItem value="StoreCredit">Store Credit</SelectItem>
                                                    <SelectItem value="Exchange">Exchange</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="resolutionNotes">Resolution Notes</Label>
                                            <Textarea
                                                id="resolutionNotes"
                                                placeholder="Add notes about the resolution"
                                                value={resolutionNotes}
                                                onChange={(e) => setResolutionNotes(e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    {resolutionType === "Refund" && (
                                        <div className="space-y-2">
                                            <Label htmlFor="refundAmount">Refund Amount</Label>
                                            <Input
                                                id="refundAmount"
                                                type="number"
                                                min={0}
                                                step={0.01}
                                                value={refundAmount}
                                                onChange={(e) => {
                                                    const value = Number.parseFloat(e.target.value)
                                                    setRefundAmount(isNaN(value) ? 0 : value) // Fallback to 0 if NaN
                                                }}
                                                placeholder="Enter refund amount"
                                            />
                                        </div>
                                    )}

                                    {resolutionType === "Replacement" && (
                                        <div className="space-y-4">
                                            <div>
                                                <h4 className="text-sm font-medium mb-2">Replacement Items</h4>
                                                <p className="text-sm text-muted-foreground mb-4">
                                                    Items to be sent as replacements for the returned products.
                                                </p>

                                                {/* Current replacement items */}
                                                <div className="space-y-2 mb-4">
                                                    {replacementItems.length > 0 ? (
                                                        <div className="border rounded-md divide-y">
                                                            {replacementItems.map((item, index) => {
                                                                const productName = inventoryItems.find((invItem) => invItem.id === item.productId)?.name || "Unknown Product";
                                                                const sku = inventoryItems.find((invItem) => invItem.id === item.productId)?.sku || "Unknown SKU";

                                                                return (
                                                                    <div key={index} className="p-3 flex items-center justify-between">
                                                                        <div className="flex-1">
                                                                            <p className="font-medium">{productName} - {sku}</p>
                                                                            <div className="flex items-center mt-1">
                                                                                <Button
                                                                                    variant="outline"
                                                                                    size="icon"
                                                                                    className="h-6 w-6 rounded-full"
                                                                                    onClick={() => updateReplacementItemQuantity(index, item.quantity - 1)}
                                                                                    disabled={item.quantity <= 1}
                                                                                >
                                                                                    <Minus className="h-3 w-3" />
                                                                                </Button>
                                                                                <span className="mx-2 text-sm">{item.quantity}</span>
                                                                                <Button
                                                                                    variant="outline"
                                                                                    size="icon"
                                                                                    className="h-6 w-6 rounded-full"
                                                                                    onClick={() => updateReplacementItemQuantity(index, item.quantity + 1)}
                                                                                >
                                                                                    <Plus className="h-3 w-3" />
                                                                                </Button>
                                                                            </div>
                                                                        </div>
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="sm"
                                                                            onClick={() => removeReplacementItem(index)}
                                                                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                                                        >
                                                                            Remove
                                                                        </Button>
                                                                    </div>
                                                                );
                                                            })}

                                                        </div>
                                                    ) : (
                                                        <div className="text-center p-4 border rounded-md bg-muted/50">
                                                            <p className="text-muted-foreground">No replacement items added yet</p>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Add new replacement item */}
                                                <div className="border rounded-md p-3 bg-muted/30">
                                                    <h5 className="font-medium mb-2">Add Item</h5>
                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                                        <div className="md:col-span-2">
                                                            <Label htmlFor="product">Product</Label>
                                                            <Select value={selectedInventoryItem} onValueChange={setSelectedInventoryItem}>
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="Select product" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {isLoadingInventory ? (
                                                                        <SelectItem value="loading" disabled>
                                                                            Loading inventory...
                                                                        </SelectItem>
                                                                    ) : (
                                                                        inventoryItems.map((item) => (
                                                                            <SelectItem key={item.id} value={item.id as string}>
                                                                                {item.name} ({item.sku})
                                                                            </SelectItem>
                                                                        ))
                                                                    )}
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                        <div>
                                                            <Label htmlFor="quantity">Quantity</Label>
                                                            <Input
                                                                id="quantity"
                                                                type="number"
                                                                min={1}
                                                                value={selectedQuantity}
                                                                onChange={(e) => setSelectedQuantity(Number.parseInt(e.target.value) || 1)}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="mt-3 flex justify-end">
                                                        <Button
                                                            onClick={addReplacementItem}
                                                            disabled={!selectedInventoryItem || selectedQuantity < 1}
                                                            size="sm"
                                                        >
                                                            <Plus className="mr-1 h-4 w-4" />
                                                            Add Item
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            <div className="flex justify-end">
                                <Button onClick={handleResolveReturn} disabled={loading}>
                                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                    {loading ? "Resolving..." : "Resolve Return"}
                                </Button>
                            </div>
                        </TabsContent>
                    </Tabs>
                )}

                <AlertDialogFooter>
                    <AlertDialogCancel>Close</AlertDialogCancel>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}

