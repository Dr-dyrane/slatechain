"use client"

import { useDispatch, useSelector } from "react-redux"
import type { AppDispatch, RootState } from "@/lib/store"
import type { ReturnRequest } from "@/lib/types"
import type { ReturnItem } from "@/lib/types/returns"
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogFooter,
    AlertDialogCancel,
} from "@/components/ui/alert-dialog"
import { AlertCircle, Loader2, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useEffect, useState } from "react"
import { fetchReturnById } from "@/lib/slices/returnSlice"
import { toast } from "sonner"
import { Alert, AlertDescription } from "../ui/alert"

interface ViewReturnModalProps {
    open: boolean
    onClose: () => void
    returnRequest: ReturnRequest | null
}

export function ViewReturnModal({ open, onClose, returnRequest }: ViewReturnModalProps) {
    const dispatch = useDispatch<AppDispatch>()
    const error = useSelector((state: RootState) => state.returns?.error)
    const [currentReturn, setCurrentReturn] = useState<ReturnRequest | null>(null)
    const [isLoadingDetails, setIsLoadingDetails] = useState(false)

    if (!returnRequest) {
        return null
    }

    if (!currentReturn) {
        return null
    }

    const formatDate = (dateString?: string) => {
        if (!dateString) return "N/A"
        return new Date(dateString).toLocaleDateString() + " " + new Date(dateString).toLocaleTimeString()
    }

    // Fetch detailed return data when modal opens
    useEffect(() => {
        if (open && returnRequest) {
            setCurrentReturn(returnRequest)
            // If we need more detailed data, fetch it
            if (!returnRequest.returnItems) {
                fetchDetailedReturnData(returnRequest._id || returnRequest.id)
            }
        }
    }, [open, returnRequest])

    const fetchDetailedReturnData = async (returnId: string) => {
        setIsLoadingDetails(true)
        try {
            const detailedReturn = await dispatch(fetchReturnById(returnId)).unwrap()
            setCurrentReturn(detailedReturn)
        } catch (error) {
            console.error("Error fetching detailed return data:", error)
            toast.error("Failed to load return details")
        } finally {
            setIsLoadingDetails(false)
        }
    }

    const getStatusBadgeColor = (status: string) => {
        const statusColors: Record<string, string> = {
            PendingApproval: "bg-yellow-500 text-white",
            Approved: "bg-blue-500 text-white",
            Rejected: "bg-red-500 text-white",
            ItemsReceived: "bg-indigo-500 text-white",
            Processing: "bg-purple-500 text-white",
            ResolutionPending: "bg-orange-500 text-white",
            Completed: "bg-green-500 text-white",
        }
        return statusColors[status] || "bg-gray-500 text-white"
    }

    // Handle nested objects from API response
    const orderNumber =
        currentReturn.orderId && typeof currentReturn.orderId === "object"
            ? currentReturn.orderId.orderNumber
            : currentReturn.order?.orderNumber || currentReturn.orderId

    const customerName =
        currentReturn.customerId && typeof currentReturn.customerId === "object"
            ? currentReturn.customerId.email || currentReturn.customerId._id
            : currentReturn.customer?.name || currentReturn.customerId

    return (
        <AlertDialog open={open} onOpenChange={onClose}>
            <AlertDialogContent
                id="view-return-modal"
                aria-describedby="view-return-modal"
                className="w-full max-w-3xl rounded-2xl mx-auto max-h-[80vh] overflow-y-auto">
                <AlertDialogHeader>
                    <div className="flex justify-between items-center">
                        <AlertDialogTitle>Return Request #{currentReturn.returnRequestNumber}</AlertDialogTitle>
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
                    <div className="space-y-4 py-4">
                        {/* Header Info */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium">Status</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <Badge className={getStatusBadgeColor(currentReturn.status)}>{currentReturn.status}</Badge>
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
                                    <CardTitle className="text-sm font-medium">Request Date</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p>{formatDate(currentReturn.requestDate || currentReturn.createdAt)}</p>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Return Details */}
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
                                            item.productId && typeof item.productId === "object"
                                                ? item.productId.name
                                                : "Unknown Product";

                                        return (
                                            <div
                                                key={index}
                                                className="p-4 rounded-2xl shadow-md border"
                                            >
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
                                        );
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
                                                        : "Unknown Product";

                                                return (
                                                    <tr key={index} className="border-b">
                                                        <td className="py-2">{productName}</td>
                                                        <td className="text-center py-2">{item.quantityRequested}</td>
                                                        <td className="text-center py-2">{item.quantityReceived || "Pending"}</td>
                                                        <td className="text-center py-2">{item.itemCondition || "Pending"}</td>
                                                        <td className="text-center py-2">{item.disposition || "Pending"}</td>
                                                    </tr>
                                                );
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
                                            <Badge className={getStatusBadgeColor(currentReturn.resolution.status)}>
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
                    </div>)}

                < AlertDialogFooter >
                    <AlertDialogCancel>Close</AlertDialogCancel>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog >
    )
}

