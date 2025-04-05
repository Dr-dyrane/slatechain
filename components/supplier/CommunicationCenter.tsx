// components/supplier/CommunicationCenter.tsx

"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { ChatMessage, Supplier } from "@/lib/types"
import { setChatLoading } from "@/lib/slices/supplierSlice"
import { ChatInterface } from "../shared/ChatInterface"
import { EmptyState } from "../shared/EmptyState"
import { useSelector } from "react-redux"
import { RootState } from "@/lib/store"

interface CommunicationCenterProps {
    suppliers: Supplier[]
    messages: Record<string, ChatMessage[]>
    onSendMessage: (supplierId: string, message: string) => void
    loading?: boolean
}

export function CommunicationCenter({ suppliers, messages, onSendMessage, loading }: CommunicationCenterProps) {
    const [selectedSupplierId, setSelectedSupplierId] = useState<string | null>(null)
    const [newMessage, setNewMessage] = useState("")
    const user = useSelector((state: RootState) => state.auth.user)

    useEffect(() => {
        setChatLoading(false)
    }, [loading])


    const handleSendMessage = () => {
        if (selectedSupplierId && newMessage.trim()) {
            onSendMessage(selectedSupplierId, newMessage)
            setNewMessage("")
        }
    }

    const selectedSupplierMessages = selectedSupplierId ? messages[selectedSupplierId] || [] : []
    // Get the selected supplier's name
    const selectedSupplier = suppliers.find((supplier) => supplier.id === selectedSupplierId)

    return (
        <Card className="h-auto flex flex-col">
            <CardHeader>
                <CardTitle>Communication Center</CardTitle>
                <CardDescription>Chat with your suppliers</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col">
                <Select onValueChange={(value) => setSelectedSupplierId(value)} value={selectedSupplierId || undefined}>
                    <SelectTrigger className="mb-4">
                        <SelectValue placeholder="Select a supplier" />
                    </SelectTrigger>
                    <SelectContent>
                        {suppliers.map((supplier) => (
                            <SelectItem key={supplier.id} value={supplier.id}>
                                {supplier.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {selectedSupplierId ? (
                    <div className="flex-grow">
                        <ChatInterface
                            messages={selectedSupplierMessages}
                            onSendMessage={handleSendMessage}
                            isLoading={loading}
                            currentUserId={user?.id || "current-user-id"}
                            currentUserName={user?.name || "Current User"}
                            placeholder={`Message to ${selectedSupplier?.name || "supplier"}...`}
                            emptyStateMessage={`No messages with ${selectedSupplier?.name || "this supplier"} yet. Start the conversation!`}
                            className="h-full"
                            value={newMessage}
                            onChange={setNewMessage}
                        />
                    </div>
                ) : (
                    <div className="flex-grow flex items-center justify-center">
                        <EmptyState
                            icon="MessageSquare"
                            title="No Supplier Selected"
                            description="Select a supplier to start chatting"
                        />
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

