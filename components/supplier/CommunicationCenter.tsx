// components/supplier/CommunicationCenter.tsx

"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { ChatMessage, Supplier } from "@/lib/types"

interface CommunicationCenterProps {
    suppliers: Supplier[]
    messages: Record<string, ChatMessage[]>
    onSendMessage: (supplierId: string, message: string) => void
}

export function CommunicationCenter({ suppliers, messages, onSendMessage }: CommunicationCenterProps) {
    const [selectedSupplierId, setSelectedSupplierId] = useState<string | null>(null)
    const [newMessage, setNewMessage] = useState("")
    const messagesEndRef = useRef<HTMLDivElement>(null)


    // Scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [messages])

    const handleSendMessage = () => {
        if (selectedSupplierId && newMessage.trim()) {
            onSendMessage(selectedSupplierId, newMessage)
            setNewMessage("")
        }
    }

    const selectedSupplierMessages = selectedSupplierId ? messages[selectedSupplierId] || [] : []

    return (
        <Card className="h-[600px] flex flex-col">
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
                {selectedSupplierId && (
                    <>
                        <ScrollArea className="flex-grow mb-4 border rounded p-2">
                            {selectedSupplierMessages.map((message) => (
                                <div key={message.id} className="mb-2">
                                    <strong>{message.senderName}:</strong> {message.message}
                                </div>
                                
                            ))}
                        </ScrollArea>
                        <div className="flex">
                            <Input
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Type your message..."
                                className="flex-grow mr-2"
                            />
                            <Button onClick={handleSendMessage}>Send</Button>
                        </div>
                    </>
                )}
                {!selectedSupplierId && (
                    <div className="flex-grow flex items-center justify-center text-muted-foreground">
                        Select a supplier to start chatting
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

