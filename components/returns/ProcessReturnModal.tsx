"use client"

import { useState, useEffect } from "react"
import { useDispatch } from "react-redux"
import { updateReturnRequest, resolveReturnRequest, fetchReturnById } from "@/lib/slices/returnSlice"
import { AppDispatch } from "@/lib/store"
import { ReturnItem, ReturnRequest, ReturnRequestStatus, ReturnType } from "@/lib/types"
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
import { Loader2, X } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface ProcessReturnModalProps {
    open: boolean
    onClose: () => void
    returnRequest: ReturnRequest | null
}

export function ProcessReturnModal({ open, onClose, returnRequest }: ProcessReturnModalProps) {
    const dispatch = useDispatch<AppDispatch>()
    const [activeTab, setActiveTab] = useState("details")
    const [loading, setLoading] = useState(false)
    const [currentReturn, setCurrentReturn] = useState<ReturnRequest | null>(null)

    // Form state
    const [status, setStatus] = useState<ReturnRequestStatus>(ReturnRequestStatus.PENDING_APPROVAL)
    const [staffComments, setStaffComments] = useState("")
    const [itemsToUpdate, setItemsToUpdate] = useState<any[]>([])

    // Resolution form state
    const [resolutionType, setResolutionType] = useState<ReturnType>(ReturnType.REFUND)
    const [resolutionNotes, setResolutionNotes] = useState("")
    const [refundAmount, setRefundAmount] = useState(0)
    const [replacementItems, setReplacementItems] = useState<any[]>([])

    useEffect(() => {
        if (returnRequest) {
            setCurrentReturn(returnRequest)
            setStatus(returnRequest.status)
            setStaffComments(returnRequest.staffComments || "")

            // Initialize items to update
            if (returnRequest.returnItems) {
                setItemsToUpdate(
                    returnRequest.returnItems.map((item) => ({
                        returnItemId: item.id,
                        quantityReceived: item.quantityReceived || 0,
                        itemCondition: item.itemCondition || undefined,
                        disposition: item.disposition || undefined,
                        returnTrackingNumber: item.returnTrackingNumber || "",
                        shippingLabelUrl: item.shippingLabelUrl || "",
                    })),
                )
            }

            // Initialize resolution form if there's a resolution
            if (returnRequest.resolution) {
                setResolutionType(returnRequest.resolution.resolutionType)
                setResolutionNotes(returnRequest.resolution.notes || "")
                setRefundAmount(returnRequest.resolution.refundAmount || 0)
                // Would need to initialize replacement items if available
            }
        }
    }, [returnRequest])

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

            await dispatch(updateReturnRequest({ id: currentReturn.id, updateData })).unwrap()
            toast.success("Return request updated successfully")

            // Refresh the return data
            const updatedReturn = await dispatch(fetchReturnById(currentReturn.id)).unwrap()
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
            const resolutionData = {
                resolutionType,
                notes: resolutionNotes,
                refundAmount: resolutionType === "Refund" ? refundAmount : undefined,
                replacementItems: resolutionType === "Replacement" ? replacementItems : undefined,
            }

            await dispatch(resolveReturnRequest({ id: currentReturn.id, resolutionData })).unwrap()
            toast.success("Return request resolved successfully")

            // Refresh the return data
            const updatedReturn = await dispatch(fetchReturnById(currentReturn.id)).unwrap()
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

    const formatDate = (dateString?: string) => {
        if (!dateString) return "N/A"
        return new Date(dateString).toLocaleDateString() + " " + new Date(dateString).toLocaleTimeString()
    }

    if (!currentReturn) {
        return null
    }

    const canResolve = ["Approved", "ItemsReceived", "Processing"].includes(currentReturn.status)
    const isResolved = currentReturn.status === "Completed" || !!currentReturn.resolution

    return (
        <AlertDialog open={open} onOpenChange={onClose}>
            <AlertDialogContent className="w-full max-w-4xl rounded-2xl mx-auto max-h-[80vh] overflow-y-auto">
                <AlertDialogHeader>
                    <div className="flex justify-between items-center">
                        <AlertDialogTitle>Process Return #{currentReturn.returnRequestNumber}</AlertDialogTitle>
                        <button onClick={onClose} className="text-gray-500 hover:text-gray-700 p-2 bg-muted rounded-full">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </AlertDialogHeader>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full max-w-md grid-cols-3">
                        <TabsTrigger value="details">Return Details</TabsTrigger>
                        <TabsTrigger value="process" disabled={isResolved}>
                            Process Items
                        </TabsTrigger>
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
                                    <p>{currentReturn.order?.orderNumber || currentReturn.orderId}</p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium">Customer</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p>{currentReturn.customer?.name || currentReturn.customerId}</p>
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
                                <div className="overflow-x-auto">
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
                                            {currentReturn.returnItems?.map((item: ReturnItem, index: number) => (
                                                <tr key={index} className="border-b">
                                                    <td className="py-2">{item.product?.name || item.productId}</td>
                                                    <td className="text-center py-2">{item.quantityRequested}</td>
                                                    <td className="text-center py-2">{item.quantityReceived || "Pending"}</td>
                                                    <td className="text-center py-2">{item.itemCondition || "Pending"}</td>
                                                    <td className="text-center py-2">{item.disposition || "Pending"}</td>
                                                </tr>
                                            ))}
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
                                            <p>${currentReturn.resolution.refundAmount.toFixed(2)}</p>
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
                                        return (
                                            <div key={index} className="border rounded-md p-4 space-y-3">
                                                <div className="flex justify-between items-center">
                                                    <h4 className="font-medium">{item.product?.name || item.productId}</h4>
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
                                                                <SelectItem value="NotDecided">Not Decided</SelectItem>
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
                                            onChange={(e) => setRefundAmount(Number.parseFloat(e.target.value))}
                                        />
                                    </div>
                                )}

                                {resolutionType === "Replacement" && (
                                    <div className="space-y-2">
                                        <Label>Replacement Items</Label>
                                        <p className="text-sm text-muted-foreground mb-2">
                                            For simplicity, we'll use the original items as replacements. In a real implementation, you would
                                            select specific replacement items here.
                                        </p>
                                        <div className="border rounded-md p-3">
                                            {currentReturn.returnItems?.map((item: ReturnItem, index: number) => (
                                                <div key={index} className="py-2 border-b last:border-b-0">
                                                    <p>
                                                        {item.product?.name || item.productId} - Qty: {item.quantityRequested}
                                                    </p>
                                                </div>
                                            ))}
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

                <AlertDialogFooter>
                    <AlertDialogCancel>Close</AlertDialogCancel>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}

