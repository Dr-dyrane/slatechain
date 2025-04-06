"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { format } from "date-fns"
import type { Contract, Supplier, Bid } from "@/lib/types"
import { FileText, Calendar, User, Tag, FileSignature, AlertTriangle, Edit, Gavel } from "lucide-react"
import { ContractFormModal } from "./ContractFormModal"
import { BidList } from "./BidList"

interface ContractDetailsModalProps {
    open: boolean
    onClose: () => void
    contract: Contract
    onUpdate?: (contractData: Partial<Contract>) => void
    onSign?: (contractId: string) => void
    onTerminate?: () => void
    suppliers?: Supplier[]
    isSupplierView?: boolean
    onBid?: () => void
    bids?: Bid[]
}

export function ContractDetailsModal({
    open,
    onClose,
    contract,
    onUpdate,
    onSign,
    onTerminate,
    suppliers = [],
    isSupplierView = false,
    onBid,
    bids = [],
}: ContractDetailsModalProps) {
    const [activeTab, setActiveTab] = useState("details")
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)

    const getSupplierName = () => {
        if (!contract.supplierId) return "Open Contract"
        const supplier = suppliers.find((s) => s.id === contract.supplierId)
        return supplier ? supplier.name : "Unknown Supplier"
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "draft":
                return <Badge variant="outline">Draft</Badge>
            case "open":
                return <Badge variant="secondary">Open</Badge>
            case "active":
                return <Badge variant="success">Active</Badge>
            case "completed":
                return <Badge variant="default">Completed</Badge>
            case "expired":
                return <Badge variant="warning">Expired</Badge>
            case "terminated":
                return <Badge variant="destructive">Terminated</Badge>
            default:
                return <Badge variant="outline">{status}</Badge>
        }
    }

    const handleEditClick = () => {
        setIsEditModalOpen(true)
    }

    const handleUpdateContract = (contractData: Partial<Contract>) => {
        if (onUpdate) {
            onUpdate(contractData)
            setIsEditModalOpen(false)
        }
    }

    return (
        <>
            <Dialog open={open} onOpenChange={onClose}>
                <DialogContent className="sm:max-w-[700px]">
                    <DialogHeader>
                        <div className="flex justify-between items-center">
                            <DialogTitle className="text-xl">{contract.title}</DialogTitle>
                            <div className="flex items-center gap-2">
                                {getStatusBadge(contract.status)}
                                {!isSupplierView && onUpdate && (
                                    <Button variant="outline" size="icon" onClick={handleEditClick}>
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                        </div>
                    </DialogHeader>

                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="details">Contract Details</TabsTrigger>
                            <TabsTrigger value="bids">Bids</TabsTrigger>
                        </TabsList>

                        <TabsContent value="details" className="space-y-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex items-center gap-2">
                                    <FileText className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm font-medium">Contract Number:</span>
                                    <span className="text-sm">{contract.contractNumber}</span>
                                </div>

                                <div className="flex items-center gap-2">
                                    <User className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm font-medium">Supplier:</span>
                                    <span className="text-sm">{getSupplierName()}</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm font-medium">Start Date:</span>
                                    <span className="text-sm">{format(new Date(contract.startDate), "PPP")}</span>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm font-medium">End Date:</span>
                                    <span className="text-sm">{format(new Date(contract.endDate), "PPP")}</span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="text-sm font-medium">Description:</div>
                                <div className="text-sm rounded-md bg-muted p-3">
                                    {contract.description || "No description provided."}
                                </div>
                            </div>

                            {contract.notes && (
                                <div className="space-y-2">
                                    <div className="text-sm font-medium">Notes:</div>
                                    <div className="text-sm rounded-md bg-muted p-3">{contract.notes}</div>
                                </div>
                            )}

                            <div className="space-y-2">
                                <div className="text-sm font-medium">Tags:</div>
                                <div className="flex flex-wrap gap-2">
                                    {contract.tags && contract.tags.length > 0 ? (
                                        contract.tags.map((tag) => (
                                            <Badge key={tag} variant="outline">
                                                <Tag className="h-3 w-3 mr-1" />
                                                {tag}
                                            </Badge>
                                        ))
                                    ) : (
                                        <span className="text-sm text-muted-foreground">No tags</span>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex items-center gap-2">
                                    <FileSignature className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm font-medium">Signed by Supplier:</span>
                                    <Badge variant={contract.signedBySupplier ? "success" : "outline"}>
                                        {contract.signedBySupplier ? "Yes" : "No"}
                                    </Badge>
                                </div>

                                <div className="flex items-center gap-2">
                                    <FileSignature className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm font-medium">Signed by Admin:</span>
                                    <Badge variant={contract.signedByAdmin ? "success" : "outline"}>
                                        {contract.signedByAdmin ? "Yes" : "No"}
                                    </Badge>
                                </div>
                            </div>

                            {contract.isTerminated && (
                                <div className="space-y-2">
                                    <div className="text-sm font-medium text-destructive flex items-center">
                                        <AlertTriangle className="h-4 w-4 mr-1" />
                                        Termination Reason:
                                    </div>
                                    <div className="text-sm rounded-md bg-destructive/10 p-3 text-destructive">
                                        {contract.terminationReason || "No reason provided."}
                                    </div>
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="bids" className="py-4">
                            {contract.status === "open" && isSupplierView && (
                                <div className="mb-4">
                                    <Button onClick={onBid}>
                                        <Gavel className="h-4 w-4 mr-2" />
                                        Submit Bid
                                    </Button>
                                </div>
                            )}

                            {bids.length > 0 ? (
                                <BidList bids={bids} isSupplierView={isSupplierView} />
                            ) : (
                                <div className="text-center py-8 text-muted-foreground">
                                    <Gavel className="h-12 w-12 mx-auto mb-2 opacity-20" />
                                    <p>No bids have been submitted for this contract yet.</p>
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>

                    <DialogFooter className="gap-2">
                        {contract.status === "active" && (
                            <>
                                {isSupplierView && !contract.signedBySupplier && onSign && (
                                    <Button onClick={() => onSign(contract.id)}>
                                        <FileSignature className="h-4 w-4 mr-2" />
                                        Sign Contract
                                    </Button>
                                )}

                                {!isSupplierView && !contract.signedByAdmin && onSign && (
                                    <Button onClick={() => onSign(contract.id)}>
                                        <FileSignature className="h-4 w-4 mr-2" />
                                        Sign Contract
                                    </Button>
                                )}

                                {!isSupplierView && onTerminate && (
                                    <Button variant="destructive" onClick={onTerminate}>
                                        <AlertTriangle className="h-4 w-4 mr-2" />
                                        Terminate Contract
                                    </Button>
                                )}
                            </>
                        )}

                        {contract.status === "open" && isSupplierView && onBid && (
                            <Button onClick={onBid}>
                                <Gavel className="h-4 w-4 mr-2" />
                                Submit Bid
                            </Button>
                        )}

                        <Button variant="outline" onClick={onClose}>
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Contract Modal */}
            {onUpdate && suppliers && (
                <ContractFormModal
                    open={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    onSubmit={handleUpdateContract}
                    suppliers={suppliers}
                    title="Edit Contract"
                    contract={contract}
                />
            )}
        </>
    )
}

