"use client"

import type React from "react"

import { useState } from "react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { AlertTriangle } from "lucide-react"

interface TerminateContractModalProps {
    open: boolean
    onClose: () => void
    onTerminate: (reason: string) => void
    contractTitle: string
}

export function TerminateContractModal({ open, onClose, onTerminate, contractTitle }: TerminateContractModalProps) {
    const [reason, setReason] = useState("")

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onTerminate(reason)
    }

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center text-destructive">
                        <AlertTriangle className="h-5 w-5 mr-2" />
                        Terminate Contract
                    </DialogTitle>
                    <DialogDescription>
                        You are about to terminate the contract: <strong>{contractTitle}</strong>. This action cannot be undone.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="reason" className="text-destructive">
                                Termination Reason (Required)
                            </Label>
                            <Textarea
                                id="reason"
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                rows={4}
                                required
                                className="border-destructive/50 focus-visible:ring-destructive"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" variant="destructive" disabled={!reason.trim()}>
                            Terminate Contract
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

