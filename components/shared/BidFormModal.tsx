"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Bid, Contract } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import { generateReferenceNumber } from "@/lib/utils"
import { useSelector } from "react-redux"
import { RootState } from "@/lib/store"

interface BidFormModalProps {
    open: boolean
    onClose: () => void
    onSubmit: (bidData: Partial<Bid>) => void
    contract: Contract
    bid?: Bid
}

export function BidFormModal({ open, onClose, onSubmit, contract, bid }: BidFormModalProps) {
    const loading = useSelector((state: RootState) => state.contracts.bidLoading)

    const [formData, setFormData] = useState<Partial<Bid>>(
        bid || {
            title: `Bid for ${contract.title}`,
            referenceNumber: generateReferenceNumber("BID"),
            description: "",
            status: "submitted",
            submissionDate: new Date().toISOString(),
            validUntil: new Date(new Date().setMonth(new Date().getMonth() + 3)).toISOString(),
            proposedAmount: 0,
            durationInDays: 30,
            notes: "",
            tags: [],
            linkedContractId: contract.id,
        },
    )

    const [validUntil, setValidUntil] = useState<Date | undefined>(
        bid ? new Date(bid.validUntil) : new Date(new Date().setMonth(new Date().getMonth() + 3)),
    )

    const [tagInput, setTagInput] = useState("")

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: Number.parseFloat(value) || 0 }))
    }

    const handleValidUntilChange = (date: Date | undefined) => {
        if (date) {
            setValidUntil(date)
            setFormData((prev) => ({ ...prev, validUntil: date.toISOString() }))
        }
    }

    const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && tagInput.trim()) {
            e.preventDefault()
            const newTags = [...(formData.tags || []), tagInput.trim()]
            setFormData((prev) => ({ ...prev, tags: newTags }))
            setTagInput("")
        }
    }

    const handleRemoveTag = (tagToRemove: string) => {
        const newTags = (formData.tags || []).filter((tag) => tag !== tagToRemove)
        setFormData((prev) => ({ ...prev, tags: newTags }))
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onSubmit(formData)
    }

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Submit Bid for Contract</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="referenceNumber">Bid Reference Number</Label>
                                <Input
                                    id="referenceNumber"
                                    name="referenceNumber"
                                    value={formData.referenceNumber}
                                    onChange={handleChange}
                                    readOnly
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Contract</Label>
                                <div className="flex items-center h-10 px-3 rounded-md border">
                                    <span className="text-sm text-muted-foreground">{contract.contractNumber}</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="title">Bid Title</Label>
                            <Input id="title" name="title" value={formData.title} onChange={handleChange} required />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows={3}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="proposedAmount">Proposed Amount ($)</Label>
                                <Input
                                    id="proposedAmount"
                                    name="proposedAmount"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={formData.proposedAmount}
                                    onChange={handleNumberChange}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="durationInDays">Duration (Days)</Label>
                                <Input
                                    id="durationInDays"
                                    name="durationInDays"
                                    type="number"
                                    min="1"
                                    value={formData.durationInDays}
                                    onChange={handleNumberChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Valid Until</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className={cn("w-full justify-start text-left font-normal", !validUntil && "text-muted-foreground")}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {validUntil ? format(validUntil, "PPP") : "Select date"}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                        mode="single"
                                        selected={validUntil}
                                        onSelect={handleValidUntilChange}
                                        initialFocus
                                        disabled={(date) => date < new Date()}
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="notes">Additional Notes</Label>
                            <Textarea id="notes" name="notes" value={formData.notes} onChange={handleChange} rows={2} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="tags">Tags (Press Enter to add)</Label>
                            <Input
                                id="tags"
                                value={tagInput}
                                onChange={(e) => setTagInput(e.target.value)}
                                onKeyDown={handleAddTag}
                                placeholder="Add tags..."
                            />
                            <div className="flex flex-wrap gap-2 mt-2">
                                {formData.tags?.map((tag) => (
                                    <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => handleRemoveTag(tag)}>
                                        {tag} ×
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit">
                            {loading ? 'Submitting...' : "Submit Bid"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

