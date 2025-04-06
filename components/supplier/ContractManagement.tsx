"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useDispatch } from "react-redux"
import type { AppDispatch } from "@/lib/store"
import {
    fetchContracts,
    fetchSupplierContracts,
    createContract,
    updateContract,
    deleteContract,
    signContract,
    terminateContract,
} from "@/lib/slices/contractSlice"
import type { Contract, Supplier } from "@/lib/types"
import { toast } from "sonner"
import { ContractList } from "../shared/ContractList"
import { ContractFormModal } from "../shared/ContractFormModal"
import { ContractDetailsModal } from "../shared/ContractDetailsModal"
import { TerminateContractModal } from "../shared/TerminateContractModal"
import { EmptyState } from "../shared/EmptyState"
import { Plus } from "lucide-react"

interface ContractManagementProps {
    suppliers: Supplier[]
    contracts: Record<string, Contract[]>
    isLoading: boolean
    selectedSupplierId: string
    setSelectedSupplierId: (supplierId: string) => void
}

export function ContractManagement({
    suppliers,
    contracts,
    isLoading,
    selectedSupplierId,
    setSelectedSupplierId,
}: ContractManagementProps) {
    const dispatch = useDispatch<AppDispatch>()
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
    const [isTerminateModalOpen, setIsTerminateModalOpen] = useState(false)
    const [selectedContract, setSelectedContract] = useState<Contract | null>(null)

    useEffect(() => {
        if (selectedSupplierId) {
            dispatch(fetchSupplierContracts(selectedSupplierId))
        } else {
            dispatch(fetchContracts())
        }
    }, [dispatch, selectedSupplierId])

    const handleCreateContract = async (contractData: Partial<Contract>) => {
        try {
            if (selectedSupplierId) {
                contractData.supplierId = selectedSupplierId
            }

            await dispatch(createContract(contractData)).unwrap()
            toast.success("Contract created successfully")
            setIsCreateModalOpen(false)

            // Refresh contracts
            if (selectedSupplierId) {
                dispatch(fetchSupplierContracts(selectedSupplierId))
            } else {
                dispatch(fetchContracts())
            }
        } catch (error) {
            toast.error("Failed to create contract")
        }
    }

    const handleUpdateContract = async (contractData: Partial<Contract>) => {
        try {
            if (!selectedContract) return

            await dispatch(
                updateContract({
                    id: selectedContract.id,
                    data: contractData,
                }),
            ).unwrap()

            toast.success("Contract updated successfully")
            setIsDetailsModalOpen(false)

            // Refresh contracts
            if (selectedSupplierId) {
                dispatch(fetchSupplierContracts(selectedSupplierId))
            } else {
                dispatch(fetchContracts())
            }
        } catch (error) {
            toast.error("Failed to update contract")
        }
    }

    const handleDeleteContract = async (contractId: string) => {
        try {
            await dispatch(deleteContract(contractId)).unwrap()
            toast.success("Contract deleted successfully")

            // Refresh contracts
            if (selectedSupplierId) {
                dispatch(fetchSupplierContracts(selectedSupplierId))
            } else {
                dispatch(fetchContracts())
            }
        } catch (error) {
            toast.error("Failed to delete contract")
        }
    }

    const handleSignContract = async (contractId: string) => {
        // This is an admin action
        try {
            await dispatch(signContract({ id: contractId, isSupplier: false })).unwrap()
            toast.success("Contract signed successfully")

            // Refresh contracts
            if (selectedSupplierId) {
                dispatch(fetchSupplierContracts(selectedSupplierId))
            } else {
                dispatch(fetchContracts())
            }
        } catch (error) {
            toast.error("Failed to sign contract")
        }
    }

    const handleTerminateContract = async (contractId: string, reason: string) => {
        try {
            await dispatch(terminateContract({ id: contractId, reason })).unwrap()
            toast.success("Contract terminated successfully")
            setIsTerminateModalOpen(false)

            // Refresh contracts
            if (selectedSupplierId) {
                dispatch(fetchSupplierContracts(selectedSupplierId))
            } else {
                dispatch(fetchContracts())
            }
        } catch (error) {
            toast.error("Failed to terminate contract")
        }
    }

    const handleViewContract = (contract: Contract) => {
        setSelectedContract(contract)
        setIsDetailsModalOpen(true)
    }

    const handleTerminateClick = (contract: Contract) => {
        setSelectedContract(contract)
        setIsTerminateModalOpen(true)
    }

    const selectedSupplierContracts = selectedSupplierId ? contracts[selectedSupplierId] || [] : []

    return (
        <Card className="h-auto flex flex-col">
            <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <CardTitle>Contract Management</CardTitle>
                        <CardDescription>Manage supplier contracts</CardDescription>
                    </div>
                    <Button onClick={() => setIsCreateModalOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        New Contract
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col">
                <Select onValueChange={(value) => setSelectedSupplierId(value)} value={selectedSupplierId || undefined}>
                    <SelectTrigger className="mb-4">
                        <SelectValue placeholder="All Suppliers" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Suppliers</SelectItem>
                        {suppliers.map((supplier) => (
                            <SelectItem key={supplier.id} value={supplier.id}>
                                {supplier.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {selectedSupplierId ? (
                    selectedSupplierContracts.length > 0 ? (
                        <ContractList
                            contracts={selectedSupplierContracts}
                            isLoading={isLoading}
                            onViewContract={handleViewContract}
                            onDeleteContract={handleDeleteContract}
                            onSignContract={handleSignContract}
                            onTerminateContract={handleTerminateClick}
                        />
                    ) : (
                        <EmptyState
                            icon="FileText"
                            title="No Contracts Found"
                            description={`No contracts found for this supplier. Create a new contract to get started.`}
                        />
                    )
                ) : (
                    <EmptyState
                        icon="FileText"
                        title="Select a Supplier"
                        description="Select a supplier to view their contracts or create a new contract."
                    />
                )}
            </CardContent>

            {/* Create Contract Modal */}
            <ContractFormModal
                open={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSubmit={handleCreateContract}
                suppliers={suppliers}
                selectedSupplierId={selectedSupplierId}
                title="Create New Contract"
            />

            {/* Contract Details Modal */}
            {selectedContract && (
                <ContractDetailsModal
                    open={isDetailsModalOpen}
                    onClose={() => setIsDetailsModalOpen(false)}
                    contract={selectedContract}
                    onUpdate={handleUpdateContract}
                    onSign={(contractId) => handleSignContract(contractId)}
                    onTerminate={() => {
                        setIsDetailsModalOpen(false)
                        setIsTerminateModalOpen(true)
                    }}
                    suppliers={suppliers}
                />
            )}

            {/* Terminate Contract Modal */}
            {selectedContract && (
                <TerminateContractModal
                    open={isTerminateModalOpen}
                    onClose={() => setIsTerminateModalOpen(false)}
                    onTerminate={(reason) => handleTerminateContract(selectedContract.id, reason)}
                    contractTitle={selectedContract.title}
                />
            )}
        </Card>
    )
}

