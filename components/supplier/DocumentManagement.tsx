import React, { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { SupplierDocument, Supplier } from "@/lib/types"
import { FileText, Trash2, Upload } from 'lucide-react'

interface DocumentManagementProps {
    suppliers: Supplier[]
    documents: Record<string, SupplierDocument[]>
    onUploadDocument: (supplierId: string, file: File) => void
    onDeleteDocument: (supplierId: string, documentId: string) => void
}

export function DocumentManagement({ suppliers, documents, onUploadDocument, onDeleteDocument }: DocumentManagementProps) {
    const [selectedSupplierId, setSelectedSupplierId] = useState<string | null>(null)
    const [selectedFile, setSelectedFile] = useState<File | null>(null)

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            setSelectedFile(event.target.files[0])
        }
    }

    const handleUpload = () => {
        if (selectedSupplierId && selectedFile) {
            onUploadDocument(selectedSupplierId, selectedFile)
            setSelectedFile(null)
        }
    }

    const selectedSupplierDocuments = selectedSupplierId ? documents[selectedSupplierId] || [] : []

    return (
        <Card className="h-[600px] flex flex-col">
            <CardHeader>
                <CardTitle>Document Management</CardTitle>
                <CardDescription>Upload and manage supplier documents</CardDescription>
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
                        <div className="mb-4 flex items-center">
                            <Input type="file" onChange={handleFileChange} className="flex-grow mr-2" />
                            <Button onClick={handleUpload} disabled={!selectedFile}>
                                <Upload className="mr-2 h-4 w-4" />
                                Upload
                            </Button>
                        </div>
                        <div className="space-y-2 flex-grow overflow-auto">
                            {selectedSupplierDocuments.map((doc) => (
                                <div key={doc.id} className="flex items-center justify-between p-2 bg-muted rounded-md">
                                    <div className="flex items-center">
                                        <FileText className="mr-2 h-4 w-4" />
                                        <span>{doc.name}</span>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => onDeleteDocument(selectedSupplierId, doc.id)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </>
                )}
                {!selectedSupplierId && (
                    <div className="flex-grow flex items-center justify-center text-muted-foreground">
                        Select a supplier to manage documents
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

