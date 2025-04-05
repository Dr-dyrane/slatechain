// components/porta;/CommunicationCenter.tsx

"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { ChatMessage } from "@/lib/types"
import { setChatLoading } from "@/lib/slices/supplierSlice"
import { ChatInterface } from "../shared/ChatInterface"
import { EmptyState } from "../shared/EmptyState"
import { useSelector } from "react-redux"
import { RootState } from "@/lib/store"

interface CommunicationCenterProps {
    onSendMessage: (supplierId: string, message: string) => void
    loading?: boolean
}

export function CommunicationCenter({ onSendMessage, loading }: CommunicationCenterProps) {
    const user = useSelector((state: RootState) => state.auth.user)
    const [newMessage, setNewMessage] = useState("")
    const chatMessagesBySupplier = useSelector((state: RootState) => state.supplier.chatMessagesBySupplier) as Record<string, ChatMessage[]> || {}
    if (!user) {
        return null
    }
    const messages = chatMessagesBySupplier[user.id] ?? [];

    const selectedSupplierId = user.id

    useEffect(() => {
        setChatLoading(false)
    }, [loading])


    const handleSendMessage = () => {
        if (user.id && newMessage.trim()) {
            onSendMessage(user.id, newMessage)
            setNewMessage("")
        }
    }

    return (
        <Card className="h-auto flex flex-col">
            <CardHeader>
                <CardTitle>Communication Center</CardTitle>
                <CardDescription>Chat with your Admin and Managers</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col">

                {selectedSupplierId ? (
                    <div className="flex-grow">
                        <ChatInterface
                            messages={messages}
                            onSendMessage={handleSendMessage}
                            isLoading={loading}
                            currentUserId={user?.id || "current-user-id"}
                            currentUserName={user?.name || "Current User"}
                            placeholder={`Message to ${user?.name || "supplier"}...`}
                            emptyStateMessage={`No messages with ${user?.name || "this supplier"} yet. Start the conversation!`}
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

