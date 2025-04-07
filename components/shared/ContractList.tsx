"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Eye, MoreVertical, Trash2, FileSignature, AlertTriangle, Calendar, Hash } from "lucide-react"
import type { Contract } from "@/lib/types"
import { format } from "date-fns"
import { Skeleton } from "@/components/ui/skeleton"
import { DeleteModal } from "../supplier/DeleteSupplierModal"

interface ContractListProps {
    contracts: Contract[]
    isLoading: boolean
    onViewContract: (contract: Contract) => void
    onDeleteContract?: (contractId: string) => void
    onSignContract: (contractId: string) => void
    onTerminateContract?: (contract: Contract) => void
    isSupplierView?: boolean
}

export function ContractList({
    contracts,
    isLoading,
    onViewContract,
    onDeleteContract,
    onSignContract,
    onTerminateContract,
    isSupplierView = false,
}: ContractListProps) {
    const [deleteModalOpen, setDeleteModalOpen] = useState(false)
    const [contractToDelete, setContractToDelete] = useState<Contract | null>(null)

    const handleDeleteClick = (contract: Contract) => {
        setContractToDelete(contract)
        setDeleteModalOpen(true)
    }

    const handleConfirmDelete = () => {
        if (contractToDelete && onDeleteContract) {
            onDeleteContract(contractToDelete.id)
            setDeleteModalOpen(false)
            setContractToDelete(null)
        }
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

    const renderActions = (contract: Contract) => (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                    <MoreVertical className="h-4 w-4" />
                    <span className="sr-only">Actions</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onViewContract(contract)}>
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                </DropdownMenuItem>

                {/* Sign option - only show if not signed by the current role */}
                {(isSupplierView && !contract.signedBySupplier && contract.status === "active") ||
                    (!isSupplierView && !contract.signedByAdmin && contract.status === "active") ? (
                    <DropdownMenuItem onClick={() => onSignContract(contract.id)}>
                        <FileSignature className="h-4 w-4 mr-2" />
                        Sign Contract
                    </DropdownMenuItem>
                ) : null}

                {/* Terminate option - only show for admin/manager view */}
                {!isSupplierView && contract.status === "active" && onTerminateContract && (
                    <DropdownMenuItem onClick={() => onTerminateContract(contract)}>
                        <AlertTriangle className="h-4 w-4 mr-2" />
                        Terminate Contract
                    </DropdownMenuItem>
                )}

                {/* Delete option - only show for admin/manager view and draft contracts */}
                {!isSupplierView && contract.status === "draft" && onDeleteContract && (
                    <DropdownMenuItem onClick={() => handleDeleteClick(contract)}>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Contract
                    </DropdownMenuItem>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    )

    if (isLoading) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
            </div>
        )
    }

    return (
        <>
            {/* Mobile and Tablet View (sm) */}
            <div className="space-y-4 md:hidden">
                {contracts.map((contract) => (
                    <Card key={contract.id} className="overflow-hidden">
                        <CardContent className="p-0">
                            <div className="p-4 flex items-center justify-between border-b">
                                <div className="flex flex-col">
                                    <div className="font-medium">{contract.title}</div>
                                    <div className="text-sm text-muted-foreground flex items-center gap-1">
                                        <Hash className="h-3 w-3" />
                                        {contract.contractNumber}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {getStatusBadge(contract.status)}
                                    {renderActions(contract)}
                                </div>
                            </div>
                            <div className="p-4 grid grid-cols-2 gap-4 text-sm">
                                <div className="flex flex-col">
                                    <span className="text-muted-foreground flex items-center gap-1">
                                        <Calendar className="h-3 w-3" /> Start Date
                                    </span>
                                    <span>{format(new Date(contract.startDate), "MMM d, yyyy")}</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-muted-foreground flex items-center gap-1">
                                        <Calendar className="h-3 w-3" /> End Date
                                    </span>
                                    <span>{format(new Date(contract.endDate), "MMM d, yyyy")}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Desktop View (md and above) */}
            <div className="hidden md:block rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Contract #</TableHead>
                            <TableHead>Title</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Start Date</TableHead>
                            <TableHead>End Date</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {contracts.map((contract) => (
                            <TableRow key={contract.id}>
                                <TableCell className="font-medium">{contract.contractNumber}</TableCell>
                                <TableCell>{contract.title}</TableCell>
                                <TableCell>{getStatusBadge(contract.status)}</TableCell>
                                <TableCell>{format(new Date(contract.startDate), "MMM d, yyyy")}</TableCell>
                                <TableCell>{format(new Date(contract.endDate), "MMM d, yyyy")}</TableCell>
                                <TableCell className="text-right">{renderActions(contract)}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Delete Confirmation Modal */}
            {contractToDelete && (
                <DeleteModal
                    open={deleteModalOpen}
                    onClose={() => setDeleteModalOpen(false)}
                    // @ts-expect-error
                    onConfirm={handleConfirmDelete}
                    data={contractToDelete}
                    deleteModalTitle="Delete Contract"
                    deleteModalDescription="Are you sure you want to delete this contract? This action cannot be undone."
                />
            )}
        </>
    )
}

