"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Eye, MoreVertical, Trash2, FileSignature, AlertTriangle } from "lucide-react"
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
        <div className="rounded-md border">
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
                            <TableCell className="text-right">
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
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

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
        </div>
    )
}

