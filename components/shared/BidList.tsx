"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Calendar, DollarSign, Clock, User } from "lucide-react"
import { UserRole, type Bid, type Supplier } from "@/lib/types"
import { format } from "date-fns"
import { useSelector, useDispatch } from "react-redux"
import type { RootState, AppDispatch } from "@/lib/store"
import { Skeleton } from "../ui/skeleton"
import { acceptBid, rejectBid, fetchContractBids } from "@/lib/slices/contractSlice"
import { toast } from "sonner"

interface BidListProps {
    bids: Bid[]
    isSupplierView?: boolean
    suppliers?: Supplier[]
    onClose?: () => void
}

export function BidList({ bids, isSupplierView = false, suppliers = [], onClose }: BidListProps) {
    const bidLoading = useSelector((state: RootState) => state.contracts.bidLoading)
    const user = useSelector((state: RootState) => state.auth.user)
    const dispatch = useDispatch<AppDispatch>()

    // Check if user is admin or manager
    const canManageBids = user?.role === UserRole.ADMIN || user?.role === UserRole.MANAGER

    // Function to get supplier name from ID
    const getSupplierName = (supplierId: string): string => {
        const supplier = suppliers.find((s) => s.id === supplierId)
        return supplier ? supplier.name : "Unknown Supplier"
    }

    // Handle bid acceptance
    const handleAcceptBid = async (bidId: string, contractId?: string) => {
        try {
            await dispatch(acceptBid(bidId)).unwrap()
            toast.success("Bid accepted successfully")

            // Refresh bids if contract ID is available
            if (contractId) {
                dispatch(fetchContractBids(contractId))
            }
            // Close the modal if onClose function is provided
            if (onClose) {
                onClose()
            }
        } catch (error) {
            toast.error("Failed to accept bid")
            console.error("Error accepting bid:", error)
        }
    }

    // Handle bid rejection
    const handleRejectBid = async (bidId: string, contractId?: string) => {
        try {
            await dispatch(rejectBid(bidId)).unwrap()
            toast.success("Bid rejected successfully")

            // Refresh bids if contract ID is available
            if (contractId) {
                dispatch(fetchContractBids(contractId))
            }
            // Close the modal if onClose function is provided
            if (onClose) {
                onClose()
            }
        } catch (error) {
            toast.error("Failed to reject bid")
            console.error("Error rejecting bid:", error)
        }
    }

    if (bidLoading) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
            </div>
        )
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "submitted":
                return <Badge variant="outline">Submitted</Badge>
            case "under_review":
                return <Badge variant="secondary">Under Review</Badge>
            case "accepted":
                return <Badge variant="success">Accepted</Badge>
            case "rejected":
                return <Badge variant="destructive">Rejected</Badge>
            default:
                return <Badge variant="outline">{status}</Badge>
        }
    }

    const renderActions = (bid: Bid) => {
        if (!isSupplierView && canManageBids && bid.status === "submitted") {
            return (
                <div className="flex justify-end gap-2">
                    <Badge
                        variant="outline"
                        className="cursor-pointer hover:bg-green-500 hover:text-white"
                        onClick={() => handleAcceptBid(bid.id, bid.linkedContractId)}
                    >
                        Accept
                    </Badge>
                    <Badge
                        variant="outline"
                        className="cursor-pointer hover:bg-red-500 hover:text-white"
                        onClick={() => handleRejectBid(bid.id, bid.linkedContractId)}
                    >
                        Reject
                    </Badge>
                </div>
            )
        }
        return null
    }

    return (

        <div className="space-y-4">
            {bids.map((bid) => (
                <Card key={bid.id} className="overflow-hidden">
                    <CardContent className="p-0">
                        <div className="p-4 flex items-center justify-between border-b">
                            {isSupplierView && <div className="font-medium">{bid.referenceNumber}</div>}
                            {!isSupplierView &&
                                <div className="flex flex-wrap break-words">
                                    {/* <span className="text-muted-foreground flex items-center gap-1">
                                            <User className="h-3 w-3" /> Supplier
                                        </span> */}
                                    <span>{getSupplierName(bid.supplierId)}</span>
                                </div>
                            }
                            <div className="flex items-center gap-2">{getStatusBadge(bid.status)}</div>
                        </div>
                        <div className="p-4 grid grid-cols-2 gap-4 text-sm">
                            <div className="flex flex-col">
                                <span className="text-muted-foreground flex items-center gap-1">
                                    <DollarSign className="h-3 w-3" /> Amount
                                </span>
                                <span>${bid.proposedAmount.toLocaleString()}</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-muted-foreground flex items-center gap-1">
                                    <Clock className="h-3 w-3" /> Duration
                                </span>
                                <span>{bid.durationInDays} days</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-muted-foreground flex items-center gap-1">
                                    <Calendar className="h-3 w-3" /> Valid Until
                                </span>
                                <span>{format(new Date(bid.validUntil), "MMM d, yyyy")}</span>
                            </div>
                            {!isSupplierView && canManageBids && bid.status === "submitted" && (
                                <div className="flex items-end">{renderActions(bid)}</div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}

