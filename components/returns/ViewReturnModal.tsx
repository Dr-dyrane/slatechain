"use client"

import { useSelector } from "react-redux"
import { RootState } from "@/lib/store"
import { ReturnItem, ReturnRequest } from "@/lib/types"
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogFooter,
    AlertDialogCancel,
} from "@/components/ui/alert-dialog"
import { X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface ViewReturnModalProps {
    open: boolean
    onClose: () => void
    returnRequest: ReturnRequest | null
}

export function ViewReturnModal({ open, onClose, returnRequest }: ViewReturnModalProps) {
    const user = useSelector((state: RootState) => state.auth.user)

    if (!returnRequest) {
        return null
    }

    const formatDate = (dateString?: string) => {
        if (!dateString) return "N/A"
        return new Date(dateString).toLocaleDateString() + " " + new Date(dateString).toLocaleTimeString()
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

    return (
        <AlertDialog open={open} onOpenChange={onClose}>
            <AlertDialogContent className="w-full max-w-3xl rounded-2xl mx-auto max-h-[80vh] overflow-y-auto">
                <AlertDialogHeader>
                    <div className="flex justify-between items-center">
                        <AlertDialogTitle>Return Request #{returnRequest.returnRequestNumber}</AlertDialogTitle>
                        <button onClick={onClose} className="text-gray-500 hover:text-gray-700 p-2 bg-muted rounded-full">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </AlertDialogHeader>

                <div className="space-y-4 py-4">
                    {/* Header Info */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium">Status</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Badge className={getStatusBadgeColor(returnRequest.status)}>{returnRequest.status}</Badge>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium">Order</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p>{returnRequest.order?.orderNumber || returnRequest.orderId}</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium">Request Date</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p>{formatDate(returnRequest.requestDate || returnRequest.createdAt)}</p>
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
                                    <p>{returnRequest.returnReason}</p>
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium mb-1">Preferred Return Type</h4>
                                    <p>{returnRequest.preferredReturnType}</p>
                                </div>
                            </div>

                            {returnRequest.reasonDetails && (
                                <div>
                                    <h4 className="text-sm font-medium mb-1">Additional Details</h4>
                                    <p className="text-sm">{returnRequest.reasonDetails}</p>
                                </div>
                            )}

                            {returnRequest.staffComments && (
                                <div>
                                    <h4 className="text-sm font-medium mb-1">Staff Comments</h4>
                                    <p className="text-sm">{returnRequest.staffComments}</p>
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
                                        {returnRequest.returnItems?.map((item: ReturnItem, index: number) => (
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
                    {returnRequest.resolution && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Resolution</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <h4 className="text-sm font-medium mb-1">Resolution Type</h4>
                                        <p>{returnRequest.resolution.resolutionType}</p>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-medium mb-1">Status</h4>
                                        <Badge className={getStatusBadgeColor(returnRequest.resolution.status)}>
                                            {returnRequest.resolution.status}
                                        </Badge>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-medium mb-1">Resolution Date</h4>
                                        <p>{formatDate(returnRequest.resolution.resolutionDate)}</p>
                                    </div>
                                </div>

                                {returnRequest.resolution.notes && (
                                    <div>
                                        <h4 className="text-sm font-medium mb-1">Resolution Notes</h4>
                                        <p className="text-sm">{returnRequest.resolution.notes}</p>
                                    </div>
                                )}

                                {returnRequest.resolution.refundAmount && (
                                    <div>
                                        <h4 className="text-sm font-medium mb-1">Refund Amount</h4>
                                        <p>${returnRequest.resolution.refundAmount.toFixed(2)}</p>
                                    </div>
                                )}

                                {returnRequest.resolution.replacementOrderId && (
                                    <div>
                                        <h4 className="text-sm font-medium mb-1">Replacement Order</h4>
                                        <p>{returnRequest.resolution.replacementOrderId}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}
                </div>

                <AlertDialogFooter>
                    <AlertDialogCancel>Close</AlertDialogCancel>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}

