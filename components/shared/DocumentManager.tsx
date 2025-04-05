// components/shared/DocumentManager.tsx

"use client"

import type React from "react"
import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { EmptyState } from "./EmptyState"
import type { SupplierDocument } from "@/lib/types"
import {
    FileText,
    Upload,
    Trash2,
    Download,
    type File,
    FileImage,
    FileSpreadsheet,
    FileIcon as FilePdf,
} from "lucide-react"
import { format } from "date-fns"

interface DocumentManagerProps {
    documents: SupplierDocument[]
    onUploadDocument: (file: File) => void
    onDeleteDocument: (documentId: string) => void
    isLoading?: boolean
    className?: string
    documentTypes?: string[]
    emptyStateMessage?: string
}

export const DocumentManager: React.FC<DocumentManagerProps> = ({
    documents,
    onUploadDocument,
    onDeleteDocument,
    isLoading = false,
    className = "",
    documentTypes = ["CONTRACT", "CERTIFICATE", "INSURANCE", "COMPLIANCE", "OTHER"],
    emptyStateMessage = "No documents uploaded yet.",
}) => {
    const [selectedType, setSelectedType] = useState(documentTypes[0])
    const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
    const [previewDocument, setPreviewDocument] = useState<SupplierDocument | null>(null)
    const [previewDialogOpen, setPreviewDialogOpen] = useState(false)
    const [documentToDelete, setDocumentToDelete] = useState<string | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file && selectedType) {
            onUploadDocument(file)
            setUploadDialogOpen(false)

            // Reset file input
            if (fileInputRef.current) {
                fileInputRef.current.value = ""
            }
        }
    }

    const handlePreview = (document: SupplierDocument) => {
        setPreviewDocument(document)
        setPreviewDialogOpen(true)
    }

    const confirmDelete = (documentId: string) => {
        setDocumentToDelete(documentId)
    }

    const handleDelete = () => {
        if (documentToDelete) {
            onDeleteDocument(documentToDelete)
            setDocumentToDelete(null)
        }
    }

    const getFileIcon = (type: string) => {
        if (type.includes("image")) {
            return <FileImage className="h-5 w-5 text-blue-500" />
        } else if (type.includes("pdf")) {
            return <FilePdf className="h-5 w-5 text-red-500" />
        } else if (type.includes("spreadsheet") || type.includes("excel") || type.includes("csv")) {
            return <FileSpreadsheet className="h-5 w-5 text-green-500" />
        } else {
            return <FileText className="h-5 w-5 text-gray-500" />
        }
    }

    const formatDate = (dateString: string) => {
        try {
            return format(new Date(dateString), "MMM d, yyyy")
        } catch (error) {
            return "Unknown date"
        }
    }

    const canPreview = (url: string) => {
        const extension = url.split(".").pop()?.toLowerCase()
        return ["jpg", "jpeg", "png", "gif", "webp", "pdf"].includes(extension || "")
    }

    return (
        <Card className={`h-full ${className}`}>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Documents</CardTitle>
                <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Upload className="h-4 w-4 mr-2" />
                            Upload
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Upload Document</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="document-type">Document Type</Label>
                                <Select value={selectedType} onValueChange={setSelectedType}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select document type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {documentTypes.map((type) => (
                                            <SelectItem key={type} value={type}>
                                                {type.charAt(0) + type.slice(1).toLowerCase()}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="document-file">File</Label>
                                <Input id="document-file" type="file" ref={fileInputRef} onChange={handleFileChange} />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setUploadDialogOpen(false)}>
                                Cancel
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    // Loading state
                    <div className="space-y-4">
                        <Skeleton className="h-8 w-full" />
                        {[1, 2, 3].map((i) => (
                            <Skeleton key={i} className="h-12 w-full" />
                        ))}
                    </div>
                ) : documents.length === 0 ? (
                    // Empty state
                    <EmptyState icon='FileText' title="No Documents" description={emptyStateMessage} />
                ) : (
                    <>
                        {/* Table view for large screens */}
                        <div className="hidden lg:block overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {documents.map((doc) => (
                                        <TableRow key={doc.id}>
                                            <TableCell className="flex items-center gap-2">
                                                {getFileIcon(doc.url)}
                                                <span className="truncate max-w-[200px]">{doc.name}</span>
                                            </TableCell>
                                            <TableCell>{doc.type}</TableCell>
                                            {/* @ts-ignore */}
                                            <TableCell>{formatDate(doc.uploadedAt || doc.createdAt)}</TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button variant="ghost" size="icon" asChild>
                                                        <a href={doc.url} target="_blank" rel="noopener noreferrer">
                                                            <Download className="h-4 w-4" />
                                                        </a>
                                                    </Button>
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <Button variant="ghost" size="icon" onClick={() => confirmDelete(doc.id)}>
                                                                <Trash2 className="h-4 w-4 text-destructive" />
                                                            </Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>Delete Document</AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    Are you sure you want to delete this document? This action cannot be undone.
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Card view for small and medium screens */}
                        <div className="lg:hidden grid grid-cols-1 md:grid-cols-2 gap-4">
                            {documents.map((doc) => (
                                <Card key={doc.id} className="overflow-hidden">
                                    <CardContent className="p-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            {getFileIcon(doc.url)}
                                            <h3 className="font-medium truncate">{doc.name}</h3>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                                            <div className="text-muted-foreground">Type:</div>
                                            <div>{doc.type}</div>
                                            <div className="text-muted-foreground">Date:</div>
                                            {/* @ts-ignore */}
                                            <div>{formatDate(doc.uploadedAt || doc.createdAt)}</div>
                                        </div>
                                        <div className="flex justify-end gap-2 border-t pt-3">
                                            <Button variant="outline" size="sm" asChild>
                                                <a href={doc.url} target="_blank" rel="noopener noreferrer">
                                                    <Download className="h-4 w-4 mr-1" />
                                                    Download
                                                </a>
                                            </Button>
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="outline" size="sm" className="text-destructive border-destructive">
                                                        <Trash2 className="h-4 w-4 mr-1" />
                                                        Delete
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Delete Document</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            Are you sure you want to delete this document? This action cannot be undone.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction onClick={() => {
                                                            onDeleteDocument(doc.id);
                                                            setDocumentToDelete(null);
                                                        }}>
                                                            Delete
                                                        </AlertDialogAction></AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </>
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
                            (previewDocument.type.includes("image") ? (
                                <img
                                    src={previewDocument.url || "/placeholder.svg"}
                                    alt={previewDocument.name}
                                    className="max-h-[60vh] object-contain"
                                />
                            ) : previewDocument.url.endsWith(".pdf") ? (
                                <iframe src={previewDocument.url} className="w-full h-[60vh]" title={previewDocument.name} />
                            ) : (
                                <div className="flex flex-col items-center justify-center p-8 text-center">
                                    {getFileIcon(previewDocument.type)}
                                    <p className="mt-4">This file type cannot be previewed</p>
                                    <Button className="mt-4" asChild>
                                        <a href={previewDocument.url} target="_blank" rel="noopener noreferrer" download>
                                            <Download className="h-4 w-4 mr-2" />
                                            Download
                                        </a>
                                    </Button>
                                </div>
                            ))}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setPreviewDialogOpen(false)}>
                            Close
                        </Button>
                        {previewDocument && (
                            <Button asChild>
                                <a href={previewDocument.url} target="_blank" rel="noopener noreferrer" download>
                                    <Download className="h-4 w-4 mr-2" />
                                    Download
                                </a>
                            </Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Card>
    )
}

