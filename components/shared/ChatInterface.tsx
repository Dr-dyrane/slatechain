// components/shared/ChatInterface.tsx

"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar } from "@/components/ui/avatar"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { Send, ArrowDown } from "lucide-react"
import type { ChatMessage } from "@/lib/types"
import { EmptyState } from "./EmptyState"
import { formatDistanceToNow } from "date-fns"

interface ChatInterfaceProps {
    messages: ChatMessage[]
    onSendMessage: (message: string) => void
    isLoading?: boolean
    currentUserId: string
    currentUserName: string
    placeholder?: string
    emptyStateMessage?: string
    className?: string
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
    messages,
    onSendMessage,
    isLoading = false,
    currentUserId,
    currentUserName,
    placeholder = "Type your message...",
    emptyStateMessage = "No messages yet. Start the conversation!",
    className = "",
}) => {
    const [newMessage, setNewMessage] = useState("")
    const [showScrollButton, setShowScrollButton] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const scrollAreaRef = useRef<HTMLDivElement>(null)

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        scrollToBottom()
    }, [messages])

    // Check if we should show the scroll to bottom button
    const handleScroll = () => {
        if (!scrollAreaRef.current) return

        const { scrollTop, scrollHeight, clientHeight } = scrollAreaRef.current
        const isNearBottom = scrollHeight - scrollTop - clientHeight < 100
        setShowScrollButton(!isNearBottom)
    }

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault()
        if (newMessage.trim()) {
            onSendMessage(newMessage)
            setNewMessage("")
        }
    }

    const renderMessageTime = (timestamp: string) => {
        try {
            return formatDistanceToNow(new Date(timestamp), { addSuffix: true })
        } catch (error) {
            return "Just now"
        }
    }

    return (
        <Card className={`flex flex-col h-full ${className}`}>
            <div className="flex-1 relative">
                <ScrollArea className="h-[calc(100vh-240px)] p-4" ref={scrollAreaRef as any} onScroll={handleScroll}>
                    {isLoading ? (
                        // Loading state
                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex items-start gap-2">
                                    <Skeleton className="h-10 w-10 rounded-full" />
                                    <div className="space-y-2">
                                        <Skeleton className="h-4 w-[250px]" />
                                        <Skeleton className="h-20 w-[300px]" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : messages.length === 0 ? (
                        // Empty state
                        <EmptyState icon="MessageSquare" title="No Messages" description={emptyStateMessage} />
                    ) : (
                        // Messages
                        <div className="space-y-4">
                            {messages.map((msg) => {
                                const isCurrentUser = msg.senderId === currentUserId
                                return (
                                    <div key={msg.id} className={`flex items-start gap-2 ${isCurrentUser ? "flex-row-reverse" : ""}`}>
                                        <Avatar className="h-10 w-10">
                                            <div className="bg-primary text-primary-foreground rounded-full h-full w-full flex items-center justify-center text-sm font-medium">
                                                {msg.senderName.charAt(0).toUpperCase()}
                                            </div>
                                        </Avatar>
                                        <div className={`max-w-[75%] ${isCurrentUser ? "text-right" : ""}`}>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className={`text-sm font-medium ${isCurrentUser ? "ml-auto" : ""}`}>
                                                    {msg.senderName}
                                                </span>
                                                <span className="text-xs text-muted-foreground">{renderMessageTime(msg.timestamp)}</span>
                                            </div>
                                            <div
                                                className={`rounded-lg p-3 ${isCurrentUser ? "bg-primary text-primary-foreground" : "bg-muted"
                                                    }`}
                                            >
                                                {msg.message}
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                            {/* Typing indicator can be shown conditionally */}
                            {/* <TypingIndicator name="John" /> */}
                            <div ref={messagesEndRef} />
                        </div>
                    )}
                </ScrollArea>

                {/* Scroll to bottom button */}
                {showScrollButton && (
                    <Button size="icon" className="absolute bottom-4 right-4 rounded-full shadow-md" onClick={scrollToBottom}>
                        <ArrowDown className="h-4 w-4" />
                    </Button>
                )}
            </div>

            {/* Message input */}
            <form onSubmit={handleSendMessage} className="p-4 border-t">
                <div className="flex gap-2">
                    <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder={placeholder}
                        className="flex-1"
                        disabled={isLoading}
                    />
                    <Button type="submit" disabled={!newMessage.trim() || isLoading}>
                        <Send className="h-4 w-4 mr-2" />
                        Send
                    </Button>
                </div>
            </form>
        </Card>
    )
}

