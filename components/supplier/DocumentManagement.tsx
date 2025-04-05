import React, { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { SupplierDocument, Supplier } from "@/lib/types"
import { Download, FileText, Trash2, Upload } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog"
import { useAppDispatch } from "@/lib/store"
import { addSupplierDocument, deleteSupplierDocument, viewSupplierDocument } from "@/lib/slices/supplierSlice"
import { useToast } from "@/hooks/use-toast"
import DocumentManager from "../shared/DocumentManager"

interface DocumentManagementProps {
    suppliers: Supplier[]
    documents: Record<string, SupplierDocument[]>
    onUploadDocument?: (file: File, documentType?: string) => Promise<void>
    onDeleteDocument?: (documentId: string) => Promise<void>
    isLoading: boolean
    selectedSupplierId: string
    setSelectedSupplierId: (supplierId: string) => void
}

export function DocumentManagement({ suppliers, documents, onUploadDocument, onDeleteDocument, selectedSupplierId, setSelectedSupplierId, isLoading }: DocumentManagementProps) {
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [previewDocument, setPreviewDocument] = useState<any | null>(null)
    const [previewDialogOpen, setPreviewDialogOpen] = useState(false)
    const dispatch = useAppDispatch()
    const { toast } = useToast()


    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            setSelectedFile(event.target.files[0])
        }
    }

    const handleViewDocument = async (documentId: string) => {
        if (!selectedSupplierId) return Promise.resolve()

        try {
            const document = await dispatch(
                viewSupplierDocument({
                    selectedSupplierId,
                    documentId,
                }),
            ).unwrap()

            setPreviewDocument(document)
            setPreviewDialogOpen(true)
            return Promise.resolve()
        } catch (error) {
            console.error("Error viewing document:", error)
            toast({
                title: "Error",
                description: "Failed to view document. Please try again.",
                variant: "destructive",
            })
            return Promise.reject(error)
        }
    }

    const handleUploadDocument = async (file: File, documentType?: string) => {
        try {
            if (selectedSupplierId) {
                // Use the Redux thunk with proper payload
                await dispatch(
                    addSupplierDocument({
                        selectedSupplierId,
                        file,
                        documentType,
                    }),
                ).unwrap()

                return Promise.resolve()
            } else if (onUploadDocument) {
                // Fallback to the provided callback
                return onUploadDocument(file, documentType)
            }

            return Promise.resolve()
        } catch (error) {
            console.error("Error uploading document:", error)
            toast({
                title: "Upload failed",
                description: "Failed to upload document. Please try again.",
                variant: "destructive",
            })
            return Promise.reject(error)
        }
    }

    const handleDeleteDocument = async (documentId: string) => {
        try {
            if (selectedSupplierId) {
                await dispatch(
                    deleteSupplierDocument({
                        selectedSupplierId,
                        documentId,
                    }),
                ).unwrap()

                return Promise.resolve()
            } else if (onDeleteDocument) {
                return onDeleteDocument(documentId)
            }

            return Promise.resolve()
        } catch (error) {
            console.error("Error deleting document:", error)
            toast({
                title: "Delete failed",
                description: "Failed to delete document. Please try again.",
                variant: "destructive",
            })
            return Promise.reject(error)
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
                    <DocumentManager
                        documents={selectedSupplierDocuments}
                        onUploadDocument={handleUploadDocument}
                        onDeleteDocument={handleDeleteDocument}
                        onViewDocument={handleViewDocument}
                        isLoading={isLoading}
                        documentTypes={["CONTRACT", "CERTIFICATE", "INSURANCE", "COMPLIANCE", "OTHER"]}
                        emptyStateMessage="You haven't uploaded any documents yet."
                    />
                )}
                {!selectedSupplierId && (
                    <div className="flex-grow flex items-center justify-center text-muted-foreground">
                        Select a supplier to manage documents
                    </div>
                )}
            </CardContent>
            {/* Document Preview Dialog */}
            <Dialog open={previewDialogOpen} onOpenChange={setPreviewDialogOpen}>
                <DialogContent className="max-w-4xl">
                    <DialogHeader>
                        <DialogTitle>{previewDocument?.name}</DialogTitle>
                    </DialogHeader>
                    <div className="py-4 flex justify-center">
                        {previewDocument &&
                            (previewDocument.url?.startsWith("data:image/") ? (
                                <img
                                    src={previewDocument.url || "/placeholder.svg"}
                                    alt={previewDocument.name}
                                    className="max-h-[60vh] object-contain"
                                />
                            ) : previewDocument.url?.startsWith("data:application/pdf") ? (
                                <iframe src={previewDocument.url} className="w-full h-[60vh]" title={previewDocument.name} />
                            ) : (
                                <div className="flex flex-col items-center justify-center p-8 text-center">
                                    <p className="mt-4">This file type cannot be previewed directly</p>
                                    <Button className="mt-4" asChild>
                                        <a
                                            href={previewDocument.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            download={previewDocument.name}
                                        >
                                            <Download className="h-4 w-4 mr-2" />
                                            Download
                                        </a>
                                    </Button>
                                </div>
                            ))}
                    </div>
                </DialogContent>
            </Dialog>
        </Card>
    )
}

