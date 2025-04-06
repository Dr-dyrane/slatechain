"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Contract, Supplier } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import { generateReferenceNumber } from "@/lib/utils"

interface ContractFormModalProps {
    open: boolean
    onClose: () => void
    onSubmit: (contractData: Partial<Contract>) => void
    suppliers: Supplier[]
    selectedSupplierId?: string
    title?: string
    contract?: Contract
}

export function ContractFormModal({
    open,
    onClose,
    onSubmit,
    suppliers,
    selectedSupplierId,
    title = "Create Contract",
    contract,
}: ContractFormModalProps) {
    const [formData, setFormData] = useState<Partial<Contract>>(
        contract || {
            title: "",
            description: "",
            contractNumber: generateReferenceNumber("CNT"),
            status: selectedSupplierId ? "active" : "open",
            startDate: new Date().toISOString(),
            endDate: new Date(new Date().setMonth(new Date().getMonth() + 12)).toISOString(),
            supplierId: selectedSupplierId || "",
            version: 1,
            notes: "",
            tags: [],
        },
    )

    const [startDate, setStartDate] = useState<Date | undefined>(contract ? new Date(contract.startDate) : new Date())

    const [endDate, setEndDate] = useState<Date | undefined>(
        contract ? new Date(contract.endDate) : new Date(new Date().setMonth(new Date().getMonth() + 12)),
    )

    const [tagInput, setTagInput] = useState("")

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    const handleSelectChange = (name: string, value: string) => {
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    const handleStartDateChange = (date: Date | undefined) => {
        if (date) {
            setStartDate(date)
            setFormData((prev) => ({ ...prev, startDate: date.toISOString() }))
        }
    }

    const handleEndDateChange = (date: Date | undefined) => {
        if (date) {
            setEndDate(date)
            setFormData((prev) => ({ ...prev, endDate: date.toISOString() }))
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
                    <DialogTitle>{title}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="contractNumber">Contract Number</Label>
                                <Input
                                    id="contractNumber"
                                    name="contractNumber"
                                    value={formData.contractNumber}
                                    onChange={handleChange}
                                    readOnly
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="status">Status</Label>
                                <Select value={formData.status} onValueChange={(value) => handleSelectChange("status", value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="draft">Draft</SelectItem>
                                        <SelectItem value="open">Open</SelectItem>
                                        <SelectItem value="active">Active</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="title">Title</Label>
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
                                <Label>Start Date</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className={cn(
                                                "w-full justify-start text-left font-normal",
                                                !startDate && "text-muted-foreground",
                                            )}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {startDate ? format(startDate, "PPP") : "Select date"}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar mode="single" selected={startDate} onSelect={handleStartDateChange} initialFocus />
                                    </PopoverContent>
                                </Popover>
                            </div>

                            <div className="space-y-2">
                                <Label>End Date</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className={cn("w-full justify-start text-left font-normal", !endDate && "text-muted-foreground")}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {endDate ? format(endDate, "PPP") : "Select date"}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar
                                            mode="single"
                                            selected={endDate}
                                            onSelect={handleEndDateChange}
                                            initialFocus
                                            disabled={(date) => date < (startDate || new Date())}
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </div>

                        {!selectedSupplierId && (
                            <div className="space-y-2">
                                <Label htmlFor="supplierId">Supplier</Label>
                                <Select value={formData.supplierId} onValueChange={(value) => handleSelectChange("supplierId", value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select supplier" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="no-supplier">Open Contract (No Supplier)</SelectItem>
                                        {suppliers.map((supplier) => (
                                            <SelectItem key={supplier.id} value={supplier.id}>
                                                {supplier.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="notes">Notes</Label>
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
                        <Button type="submit">Save Contract</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

