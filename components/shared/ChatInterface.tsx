// components/shared/ChatInterface.tsx

"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
    value?: string
    onChange?: (value: string) => void
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
    value = "",
    onChange,
}) => {
    const [showScrollButton, setShowScrollButton] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const scrollAreaRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const scrollArea = scrollAreaRef.current
        if (!scrollArea) return

        const handleScroll = () => {
            setShowScrollButton(scrollArea.scrollTop + scrollArea.clientHeight < scrollArea.scrollHeight - 20)
        }

        scrollArea.addEventListener("scroll", handleScroll)
        return () => scrollArea.removeEventListener("scroll", handleScroll)
    }, [])

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault()
        if (value.trim()) {
            onSendMessage(value)
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
                <ScrollArea className="h-[calc(100vh-240px)] p-4" ref={scrollAreaRef as any}>
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
                                    <div key={msg.id} className={`flex flex-wrap items-start gap-2 ${isCurrentUser ? "flex-row-reverse" : ""}`}>
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${msg.senderName}`} />
                                            <AvatarFallback>{msg.senderName.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div className={`w-auto ${isCurrentUser ? "text-right" : ""}`}>
                                            <div
                                                className={`rounded-lg  p-3 ${isCurrentUser ? "bg-primary text-primary-foreground rounded-tr-none" : "bg-muted rounded-tl-none"
                                                    }`}
                                            >
                                                {msg.message}
                                            </div>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className={`text-sm font-medium ${isCurrentUser ? "ml-auto" : ""}`}>
                                                    {msg.senderName}
                                                </span>
                                                <span className="text-xs text-muted-foreground">{renderMessageTime(msg.timestamp
                                                    // @ts-ignore
                                                    || msg.createdAt || msg.updatedAt
                                                )}</span>
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
                        value={value}
                        onChange={(e) => onChange?.(e.target.value)} placeholder={placeholder}
                        className="flex-1"
                        disabled={isLoading}
                    />
                    <Button type="submit" disabled={!value.trim() || isLoading}>
                        <Send className="h-4 w-4 mr-2" />
                        Send
                    </Button>
                </div>
            </form>
        </Card>
    )
}

