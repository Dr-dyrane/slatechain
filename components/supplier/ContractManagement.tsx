"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useDispatch, useSelector } from "react-redux"
import type { AppDispatch, RootState } from "@/lib/store"
import {
    fetchContracts,
    fetchSupplierContracts,
    createContract,
    updateContract,
    deleteContract,
    signContract,
    terminateContract,
    clearError,
    fetchContractBids,
} from "@/lib/slices/contractSlice"
import type { Bid, Contract, Supplier } from "@/lib/types"
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
    const allContracts = useSelector((state: RootState) => state.contracts.contracts)
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
    const [isTerminateModalOpen, setIsTerminateModalOpen] = useState(false)
    const [selectedContract, setSelectedContract] = useState<Contract | null>(null)
    const [contractBids, setContractBids] = useState<Bid[]>([])

    useEffect(() => {
        // Clear any previous errors when component mounts
        dispatch(clearError())

        if (selectedSupplierId && selectedSupplierId !== "all") {
            dispatch(fetchSupplierContracts(selectedSupplierId))
        } else {
            dispatch(fetchContracts())
        }
    }, [dispatch, selectedSupplierId])

    const handleCreateContract = async (contractData: Partial<Contract>) => {
        try {
            if (selectedSupplierId && selectedSupplierId !== "all") {
                contractData.supplierId = selectedSupplierId
            }

            await dispatch(createContract(contractData)).unwrap()
            toast.success("Contract created successfully")
            setIsCreateModalOpen(false)

            // Refresh contracts
            if (selectedSupplierId && selectedSupplierId !== "all") {
                dispatch(fetchSupplierContracts(selectedSupplierId))
            } else {
                dispatch(fetchContracts())
            }
        } catch (error: any) {
            // Display the error message from the API
            toast.error(error || "Failed to create contract")
            console.error("Contract creation error:", error)
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
            if (selectedSupplierId && selectedSupplierId !== "all") {
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
            if (selectedSupplierId && selectedSupplierId !== "all") {
                dispatch(fetchSupplierContracts(selectedSupplierId))
            } else {
                dispatch(fetchContracts())
            }
        } catch (error) {
            toast.error("Failed to delete contract")
        }
    }

    const handleSignContract = async (contractId: string) => {
        try {
            await dispatch(signContract({ id: contractId, isSupplier: false })).unwrap()
            toast.success("Contract signed successfully")

            // Refresh contracts
            if (selectedSupplierId && selectedSupplierId !== "all") {
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
            if (selectedSupplierId && selectedSupplierId !== "all") {
                dispatch(fetchSupplierContracts(selectedSupplierId))
            } else {
                dispatch(fetchContracts())
            }
        } catch (error) {
            toast.error("Failed to terminate contract")
        }
    }

    const handleViewContract = async (contract: Contract) => {
        const updatedContract = { ...contract }

        // If contract has a supplier but status is still open, update it to active
        if (
            updatedContract.status === "open" &&
            updatedContract.supplierId &&
            updatedContract.supplierId !== "no-supplier"
        ) {
            updatedContract.status = "open"
        }

        setSelectedContract(updatedContract)
        setIsDetailsModalOpen(true)

        // Fetch bids for the selected contract
        try {
            const bids = await dispatch(fetchContractBids(updatedContract.id)).unwrap()
            setContractBids(bids)
        } catch (error) {
            toast.error("Failed to fetch bids for this contract")
            console.error("Bid fetch error:", error)
            setContractBids([]) // fallback to empty list
        }

    }

    const handleTerminateClick = (contract: Contract) => {
        setSelectedContract(contract)
        setIsTerminateModalOpen(true)
    }

    // Get contracts to display based on selection
    const displayContracts =
        selectedSupplierId === "all" || !selectedSupplierId ? allContracts : contracts[selectedSupplierId] || []

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
                <Select onValueChange={(value) => setSelectedSupplierId(value)} value={selectedSupplierId || "all"}>
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

                {displayContracts.length > 0 ? (
                    <ContractList
                        contracts={displayContracts}
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
                        description={
                            selectedSupplierId && selectedSupplierId !== "all"
                                ? `No contracts found for this supplier. Create a new contract to get started.`
                                : "No contracts found. Create a new contract to get started."
                        }
                    />
                )}
            </CardContent>

            {/* Create Contract Modal */}
            <ContractFormModal
                open={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSubmit={handleCreateContract}
                suppliers={suppliers}
                selectedSupplierId={selectedSupplierId !== "all" ? selectedSupplierId : undefined}
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
                    bids={contractBids}
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

