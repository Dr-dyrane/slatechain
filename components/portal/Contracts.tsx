"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useDispatch } from "react-redux"
import type { AppDispatch } from "@/lib/store"
import { fetchSupplierContracts, fetchContractBids, createBid, signContract } from "@/lib/slices/contractSlice"
import type { Contract, Bid } from "@/lib/types"
import { toast } from "sonner"
import { ContractList } from "../shared/ContractList"
import { ContractDetailsModal } from "../shared/ContractDetailsModal"
import { BidFormModal } from "../shared/BidFormModal"
import { EmptyState } from "../shared/EmptyState"

interface ContractsProps {
    contracts: Contract[]
    isLoading: boolean
    supplierId?: string
}

export function Contracts({ contracts, isLoading, supplierId }: ContractsProps) {
    const dispatch = useDispatch<AppDispatch>()
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
    const [isBidModalOpen, setIsBidModalOpen] = useState(false)
    const [selectedContract, setSelectedContract] = useState<Contract | null>(null)
    const [contractBids, setContractBids] = useState<Bid[]>([])

    useEffect(() => {
        if (supplierId) {
            dispatch(fetchSupplierContracts(supplierId))
        }
    }, [dispatch, supplierId])

    useEffect(() => {
        if (selectedContract) {
            dispatch(fetchContractBids(selectedContract.id))
                .unwrap()
                .then((bids) => setContractBids(bids))
                .catch(() => setContractBids([]))
        }
    }, [dispatch, selectedContract])

    const handleViewContract = (contract: Contract) => {
        setSelectedContract(contract)
        setIsDetailsModalOpen(true)
    }

    const handleCreateBid = async (bidData: Partial<Bid>) => {
        try {
            if (!selectedContract || !supplierId) return

            await dispatch(
                createBid({
                    ...bidData,
                    supplierId,
                    linkedContractId: selectedContract.id,
                }),
            ).unwrap()

            toast.success("Bid submitted successfully")
            setIsBidModalOpen(false)

            // Refresh contract bids
            const bids = await dispatch(fetchContractBids(selectedContract.id)).unwrap()
            setContractBids(bids)
        } catch (error) {
            toast.error("Failed to submit bid")
        }
    }

    const handleSignContract = async (contractId: string) => {
        try {
            await dispatch(signContract({ id: contractId, isSupplier: true })).unwrap()
            toast.success("Contract signed successfully")

            // Refresh contracts
            if (supplierId) {
                dispatch(fetchSupplierContracts(supplierId))
            }
        } catch (error) {
            toast.error("Failed to sign contract")
        }
    }

    const handleBidClick = () => {
        if (selectedContract) {
            setIsBidModalOpen(true)
        }
    }

    return (
        <Card className="h-auto flex flex-col">
            <CardHeader>
                <CardTitle>My Contracts</CardTitle>
                <CardDescription>View and manage your contracts</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col">
                {contracts.length > 0 ? (
                    <ContractList
                        contracts={contracts}
                        isLoading={isLoading}
                        onViewContract={handleViewContract}
                        onSignContract={handleSignContract}
                        isSupplierView={true}
                    />
                ) : (
                    <EmptyState icon="FileText" title="No Contracts Found" description="You don't have any contracts yet." />
                )}
            </CardContent>

            {/* Contract Details Modal */}
            {selectedContract && (
                <ContractDetailsModal
                    open={isDetailsModalOpen}
                    onClose={() => setIsDetailsModalOpen(false)}
                    contract={selectedContract}
                    onSign={(contractId) => handleSignContract(contractId)}
                    isSupplierView={true}
                    onBid={handleBidClick}
                    bids={contractBids}
                />
            )}

            {/* Bid Form Modal */}
            {selectedContract && (
                <BidFormModal
                    open={isBidModalOpen}
                    onClose={() => setIsBidModalOpen(false)}
                    onSubmit={handleCreateBid}
                    contract={selectedContract}
                />
            )}
        </Card>
    )
}

