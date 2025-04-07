"use client"
import DocumentManager from "../shared/DocumentManager"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { addSupplierDocument, viewSupplierDocument, deleteSupplierDocument } from "@/lib/slices/supplierSlice"
import { useAppDispatch } from "@/lib/store"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"

interface DocumentsProps {
    documents: any[]
    onUploadDocument?: (file: File, documentType?: string) => Promise<void>
    onDeleteDocument?: (documentId: string) => Promise<void>
    isLoading?: boolean
    supplierId?: string
}

export function Documents({
    documents,
    onUploadDocument,
    onDeleteDocument,
    isLoading,
    supplierId,
}: DocumentsProps) {
    const { toast } = useToast()
    const dispatch = useAppDispatch()
    const [previewDocument, setPreviewDocument] = useState<any | null>(null)
    const [previewDialogOpen, setPreviewDialogOpen] = useState(false)

    const handleUploadDocument = async (file: File, documentType?: string) => {
        try {
            if (supplierId) {
                // Use the Redux thunk with proper payload
                await dispatch(
                    addSupplierDocument({
                        supplierId,
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

    const handleViewDocument = async (documentId: string) => {
        if (!supplierId) return Promise.resolve()

        try {
            const document = await dispatch(
                viewSupplierDocument({
                    supplierId,
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

    const handleDeleteDocument = async (documentId: string) => {
        try {
            if (supplierId) {
                await dispatch(
                    deleteSupplierDocument({
                        supplierId,
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

    return (
        <Card>
            <CardHeader>
                <CardTitle>Document Management</CardTitle>
            </CardHeader>
            <CardContent>
                <DocumentManager
                    documents={documents}
                    onUploadDocument={handleUploadDocument}
                    onDeleteDocument={handleDeleteDocument}
                    onViewDocument={handleViewDocument}
                    isLoading={isLoading}
                    documentTypes={["CONTRACT", "CERTIFICATE", "INSURANCE", "COMPLIANCE", "OTHER"]}
                    emptyStateMessage="You haven't uploaded any documents yet."
                />
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

