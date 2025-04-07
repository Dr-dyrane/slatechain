"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Calendar, DollarSign, Clock, User } from "lucide-react"
import type { Bid, Supplier } from "@/lib/types"
import { format } from "date-fns"
import { useSelector } from "react-redux"
import type { RootState } from "@/lib/store"
import { Skeleton } from "../ui/skeleton"

interface BidListProps {
    bids: Bid[]
    isSupplierView?: boolean
    onAcceptBid?: (bidId: string) => void
    onRejectBid?: (bidId: string) => void
    suppliers?: Supplier[]
}

export function BidList({ bids, isSupplierView = false, onAcceptBid, onRejectBid, suppliers = [] }: BidListProps) {
    const bidLoading = useSelector((state: RootState) => state.contracts.bidLoading)

    // Function to get supplier name from ID
    const getSupplierName = (supplierId: string): string => {
        const supplier = suppliers.find((s) => s.id === supplierId)
        return supplier ? supplier.name : "Unknown Supplier"
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
        if (!isSupplierView && onAcceptBid && onRejectBid && bid.status === "submitted") {
            return (
                <div className="flex justify-end gap-2">
                    <Badge variant="outline" className="cursor-pointer hover:bg-green-50" onClick={() => onAcceptBid(bid.id)}>
                        Accept
                    </Badge>
                    <Badge variant="outline" className="cursor-pointer hover:bg-red-50" onClick={() => onRejectBid(bid.id)}>
                        Reject
                    </Badge>
                </div>
            )
        }
        return null
    }

    return (
        <>
            {/* Mobile and Tablet View (sm) */}
            <div className="space-y-4 md:hidden">
                {bids.map((bid) => (
                    <Card key={bid.id} className="overflow-hidden">
                        <CardContent className="p-0">
                            <div className="p-4 flex items-center justify-between border-b">
                                {isSupplierView && <div className="font-medium">{bid.referenceNumber}</div>}
                                {!isSupplierView && <div className="flex items-center gap-2">{getStatusBadge(bid.status)}</div>}
                            </div>
                            <div className="p-4 grid grid-cols-2 gap-4 text-sm">
                                <div className="flex flex-col">
                                    <span className="text-muted-foreground flex items-center gap-1">
                                        <User className="h-3 w-3" /> Supplier
                                    </span>
                                    <span>{getSupplierName(bid.supplierId)}</span>
                                </div>
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
                                {!isSupplierView && onAcceptBid && onRejectBid && bid.status === "submitted" && (
                                    <div className="flex items-end">{renderActions(bid)}</div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Desktop View (md and above) */}
            <div className="hidden md:block rounded-md border w-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            {isSupplierView && <TableHead>Reference #</TableHead>}
                            {!isSupplierView && <TableHead>Supplier</TableHead>}
                            <TableHead>Amount</TableHead>
                            <TableHead>Duration</TableHead>
                            <TableHead>Valid Until</TableHead>
                            <TableHead>Status</TableHead>
                            {!isSupplierView && onAcceptBid && onRejectBid && <TableHead className="text-right">Actions</TableHead>}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {bids.map((bid) => (
                            <TableRow key={bid.id}>
                                {isSupplierView && <TableCell className="font-medium">{bid.referenceNumber}</TableCell>}
                                {!isSupplierView && <TableCell>{getSupplierName(bid.supplierId)}</TableCell>}
                                <TableCell>${bid.proposedAmount.toLocaleString()}</TableCell>
                                <TableCell>{bid.durationInDays} days</TableCell>
                                <TableCell>{format(new Date(bid.validUntil), "MMM d, yyyy")}</TableCell>
                                <TableCell>{getStatusBadge(bid.status)}</TableCell>
                                {!isSupplierView && onAcceptBid && onRejectBid && bid.status === "submitted" && (
                                    <TableCell className="text-right">{renderActions(bid)}</TableCell>
                                )}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </>
    )
}

