"use client"

import { CardFooter } from "@/components/ui/card"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { ChatMessage } from "@/lib/types"
import { format } from "date-fns"
import { Send } from "lucide-react"

interface CommunicationProps {
    messages: ChatMessage[]
    onSendMessage: (message: string) => void
}

export function Communication({ messages, onSendMessage }: CommunicationProps) {
    const [newMessage, setNewMessage] = useState("")
    const messagesEndRef = useRef<HTMLDivElement>(null)

    // Scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [messages])

    const handleSend = () => {
        if (newMessage.trim()) {
            onSendMessage(newMessage)
            setNewMessage("")
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }

    // Sort messages by timestamp
    const sortedMessages = [...messages].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())

    return (
        <Card className="h-[600px] flex flex-col">
            <CardHeader>
                <CardTitle>Communication Center</CardTitle>
                <CardDescription>Chat with your managers and administrators</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow overflow-hidden">
                <ScrollArea className="h-[400px] pr-4">
                    {sortedMessages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center p-4">
                            <p className="text-muted-foreground">No messages yet</p>
                            <p className="text-sm text-muted-foreground">Start the conversation by sending a message below</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {sortedMessages.map((message) => (
                                <div key={message.id} className="flex gap-3">
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${message.senderName}`} />
                                        <AvatarFallback>{message.senderName.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex flex-col">
                                        <div className="flex items-baseline gap-2">
                                            <span className="font-medium text-sm">{message.senderName}</span>
                                            <span className="text-xs text-muted-foreground">
                                                {format(new Date(message.timestamp), "MMM d, h:mm a")}
                                            </span>
                                        </div>
                                        <p className="text-sm mt-1">{message.message}</p>
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>
                    )}
                </ScrollArea>
            </CardContent>
            <CardFooter className="border-t pt-4">
                <div className="flex w-full items-center space-x-2">
                    <Input
                        placeholder="Type your message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="flex-grow"
                    />
                    <Button onClick={handleSend} size="icon">
                        <Send className="h-4 w-4" />
                    </Button>
                </div>
            </CardFooter>
        </Card>
    )
}

