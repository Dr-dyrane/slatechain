"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import type { Bid } from "@/lib/types"
import { format } from "date-fns"

interface BidListProps {
    bids: Bid[]
    isSupplierView?: boolean
    onAcceptBid?: (bidId: string) => void
    onRejectBid?: (bidId: string) => void
}

export function BidList({ bids, isSupplierView = false, onAcceptBid, onRejectBid }: BidListProps) {
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

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Reference #</TableHead>
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
                            <TableCell className="font-medium">{bid.referenceNumber}</TableCell>
                            <TableCell>${bid.proposedAmount.toLocaleString()}</TableCell>
                            <TableCell>{bid.durationInDays} days</TableCell>
                            <TableCell>{format(new Date(bid.validUntil), "MMM d, yyyy")}</TableCell>
                            <TableCell>{getStatusBadge(bid.status)}</TableCell>
                            {!isSupplierView && onAcceptBid && onRejectBid && bid.status === "submitted" && (
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                        <Badge
                                            variant="outline"
                                            className="cursor-pointer hover:bg-green-50"
                                            onClick={() => onAcceptBid(bid.id)}
                                        >
                                            Accept
                                        </Badge>
                                        <Badge
                                            variant="outline"
                                            className="cursor-pointer hover:bg-red-50"
                                            onClick={() => onRejectBid(bid.id)}
                                        >
                                            Reject
                                        </Badge>
                                    </div>
                                </TableCell>
                            )}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}

