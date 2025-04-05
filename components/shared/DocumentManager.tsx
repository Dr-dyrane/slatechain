"use client"

import { DialogFooter } from "@/components/ui/dialog"

import type React from "react"
import { useRef, useState, useEffect } from "react"

import {
    FileText,
    Upload,
    Trash2,
    Download,
    Eye,
    type File,
    FileImage,
    FileSpreadsheet,
    FileIcon as FilePdf,
    Loader2,
} from "lucide-react"
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"

export interface SupplierDocument {
    id: string
    name: string
    url: string
    type: string
    size: number
    uploadedAt: Date
}

interface DocumentManagerProps {
    documents: SupplierDocument[]
    onUploadDocument: (file: File, documentType?: string) => Promise<void>
    onDeleteDocument: (documentId: string) => Promise<void>
    onViewDocument?: (documentId: string) => Promise<void>
    isLoading?: boolean
    className?: string
    documentTypes?: string[]
    emptyStateMessage?: string
}

const DocumentManager = ({
    documents,
    onUploadDocument,
    onDeleteDocument,
    onViewDocument,
    isLoading,
    className,
    documentTypes,
    emptyStateMessage = "No documents uploaded yet.",
}: DocumentManagerProps) => {
    const [isUploadDialogOpen, setUploadDialogOpen] = useState(false)
    const [file, setFile] = useState<File | null>(null)
    const [filePreview, setFilePreview] = useState<string | null>(null)
    const [documentToDelete, setDocumentToDelete] = useState<string | null>(null)
    const [previewDocument, setPreviewDocument] = useState<SupplierDocument | null>(null)
    const [previewDialogOpen, setPreviewDialogOpen] = useState(false)
    const [selectedDocumentType, setSelectedDocumentType] = useState<string | undefined>(undefined)
    const [uploadLoading, setUploadLoading] = useState(false)
    const [deleteLoading, setDeleteLoading] = useState(false)
    const { toast } = useToast()
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Clean up object URL when component unmounts or when file changes
    useEffect(() => {
        return () => {
            if (filePreview && filePreview.startsWith("blob:")) {
                URL.revokeObjectURL(filePreview)
            }
        }
    }, [filePreview])

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const selectedFile = e.target.files[0]
            setFile(selectedFile)

            // Clean up previous preview URL
            if (filePreview && filePreview.startsWith("blob:")) {
                URL.revokeObjectURL(filePreview)
            }

            // Create preview for the file
            if (selectedFile.type.startsWith("image/")) {
                // For images, create a preview URL
                const previewUrl = URL.createObjectURL(selectedFile)
                setFilePreview(previewUrl)
            } else if (selectedFile.type === "application/pdf") {
                // For PDFs, create a preview URL
                const previewUrl = URL.createObjectURL(selectedFile)
                setFilePreview(previewUrl)
            } else {
                // For other file types, set preview to null
                setFilePreview(null)
            }
        }
    }

    const handleUpload = async () => {
        if (file) {
            try {
                setUploadLoading(true)
                await onUploadDocument(file, selectedDocumentType)

                // Clean up preview URL
                if (filePreview && filePreview.startsWith("blob:")) {
                    URL.revokeObjectURL(filePreview)
                }

                setFile(null)
                setFilePreview(null)
                setSelectedDocumentType(undefined)

                // Reset file input
                if (fileInputRef.current) {
                    fileInputRef.current.value = ""
                }

                toast({
                    title: "Upload successful",
                    description: "Your document has been uploaded.",
                })

                // Close the dialog only after successful upload
                setUploadDialogOpen(false)
            } catch (error) {
                console.error("Error uploading document:", error)
                toast({
                    title: "Upload failed",
                    description: "There was an error uploading your document. Please try again.",
                    variant: "destructive",
                })
            } finally {
                setUploadLoading(false)
            }
        }
    }

    const handleCancelUpload = () => {
        // Don't allow cancellation during upload
        if (uploadLoading) return

        // Clean up preview URL
        if (filePreview && filePreview.startsWith("blob:")) {
            URL.revokeObjectURL(filePreview)
        }

        setFile(null)
        setFilePreview(null)
        setSelectedDocumentType(undefined)

        // Reset file input
        if (fileInputRef.current) {
            fileInputRef.current.value = ""
        }

        setUploadDialogOpen(false)
    }

    const handleDelete = async () => {
        if (documentToDelete) {
            try {
                setDeleteLoading(true)
                await onDeleteDocument(documentToDelete)

                toast({
                    title: "Delete successful",
                    description: "Your document has been deleted.",
                })
            } catch (error) {
                console.error("Error deleting document:", error)
                toast({
                    title: "Delete failed",
                    description: "There was an error deleting your document. Please try again.",
                    variant: "destructive",
                })
            } finally {
                setDeleteLoading(false)
                setDocumentToDelete(null)
            }
        }
    }

    const confirmDelete = (documentId: string) => {
        setDocumentToDelete(documentId)
    }

    const getFileIcon = (type: string) => {
        switch (type) {
            case "image/jpeg":
            case "image/png":
                return <FileImage className="h-4 w-4 mr-2" />
            case "application/pdf":
                return <FilePdf className="h-4 w-4 mr-2" />
            case "application/vnd.ms-excel":
            case "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
                return <FileSpreadsheet className="h-4 w-4 mr-2" />
            default:
                return <FileText className="h-4 w-4 mr-2" />
        }
    }

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString()
    }

    const formatFileSize = (size: number) => {
        if (size < 1024) {
            return `${size} bytes`
        } else if (size < 1024 * 1024) {
            return `${(size / 1024).toFixed(2)} KB`
        } else if (size < 1024 * 1024 * 1024) {
            return `${(size / (1024 * 1024)).toFixed(2)} MB`
        } else {
            return `${(size / (1024 * 1024 * 1024)).toFixed(2)} GB`
        }
    }

    const handlePreview = async (document: SupplierDocument) => {
        if (onViewDocument) {
            try {
                await onViewDocument(document.id)
            } catch (error) {
                console.error("Error viewing document:", error)
                toast({
                    title: "Error",
                    description: "Failed to load document preview",
                    variant: "destructive",
                })
            }
        } else {
            setPreviewDocument(document)
            setPreviewDialogOpen(true)
        }
    }

    const renderFilePreview = () => {
        if (!file || (!filePreview && !file.type.startsWith("image/") && file.type !== "application/pdf")) {
            return (
                <div className="mt-4 border rounded-md p-4 bg-muted/20 flex items-center justify-center">
                    <div className="text-center">
                        {getFileIcon(file?.type || "")}
                        <p className="text-sm mt-2">{file?.name}</p>
                        <p className="text-xs text-muted-foreground">{file ? formatFileSize(file.size) : ""}</p>
                    </div>
                </div>
            )
        }

        if (file.type.startsWith("image/")) {
            return (
                <div className="mt-4 border rounded-md p-2 bg-muted/20">
                    <p className="text-sm font-medium mb-2">Preview:</p>
                    <div className="flex justify-center">
                        <img
                            src={filePreview || "/placeholder.svg"}
                            alt="File preview"
                            className="max-h-[200px] object-contain rounded-md"
                        />
                    </div>
                </div>
            )
        } else if (file.type === "application/pdf") {
            return (
                <div className="mt-4 border rounded-md p-2 bg-muted/20">
                    <p className="text-sm font-medium mb-2">Preview:</p>
                    <iframe src={filePreview as string} className="w-full h-[200px] rounded-md" title="PDF preview" />
                </div>
            )
        }

        return null
    }

    return (
        <div className={cn("w-full", className)}>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Documents</h2>
                <Dialog
                    open={isUploadDialogOpen}
                    onOpenChange={(open) => {
                        // Prevent closing dialog during upload
                        if (uploadLoading && !open) return
                        setUploadDialogOpen(open)
                    }}
                >
                    <DialogTrigger asChild>
                        <Button variant="outline">
                            <Upload className="h-4 w-4 mr-2" />
                            Upload Document
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>Upload Document</DialogTitle>
                            <DialogDescription>Choose a file to upload.</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="file" className="text-right">
                                    File
                                </Label>
                                <Input
                                    id="file"
                                    type="file"
                                    className="col-span-3"
                                    onChange={handleFileChange}
                                    ref={fileInputRef}
                                    disabled={uploadLoading}
                                />
                            </div>
                            {documentTypes && documentTypes.length > 0 && (
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="documentType" className="text-right">
                                        Document Type
                                    </Label>
                                    <Select onValueChange={setSelectedDocumentType} disabled={uploadLoading}>
                                        <SelectTrigger className="col-span-3">
                                            <SelectValue placeholder="Select a document type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {documentTypes.map((type) => (
                                                <SelectItem key={type} value={type}>
                                                    {type}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

                            {/* File Preview */}
                            {file && renderFilePreview()}

                            {file && (
                                <div className="text-sm text-muted-foreground mt-2">
                                    <p>File: {file.name}</p>
                                    <p>Size: {formatFileSize(file.size)}</p>
                                    <p>Type: {file.type || "Unknown"}</p>
                                </div>
                            )}

                            {uploadLoading && (
                                <div className="flex items-center justify-center py-2">
                                    <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
                                    <span>Uploading document...</span>
                                </div>
                            )}
                        </div>
                        <DialogFooter>
                            <Button variant="outline" type="button" onClick={handleCancelUpload} disabled={uploadLoading}>
                                Cancel
                            </Button>
                            <Button type="button" onClick={handleUpload} disabled={!file || uploadLoading}>
                                {uploadLoading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                        Uploading...
                                    </>
                                ) : (
                                    "Upload"
                                )}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {isLoading ? (
                <div className="grid gap-4">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                </div>
            ) : documents.length === 0 ? (
                <div className="text-center py-10">
                    <p className="text-muted-foreground">{emptyStateMessage}</p>
                </div>
            ) : (
                <>
                    <div className="hidden md:block">
                        <Table>
                            <TableCaption>A list of your documents.</TableCaption>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Size</TableHead>
                                    <TableHead>Uploaded At</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {documents.map((doc) => (
                                    <TableRow key={doc.id}>
                                        <TableCell>
                                            <div className="flex items-center">
                                                {getFileIcon(doc.type)}
                                                {doc.name}
                                            </div>
                                        </TableCell>
                                        <TableCell>{doc.type}</TableCell>
                                        {/* @ts-ignore */}
                                        <TableCell>{formatFileSize(doc.fileSize)}</TableCell>
                                        {/* @ts-ignore */}
                                        <TableCell>{formatDate(doc.createdAt)}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button variant="ghost" size="icon" onClick={() => handlePreview(doc)}>
                                                    <Eye className="h-4 w-4" />
                                                </Button>
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
                                                            <AlertDialogAction onClick={handleDelete} disabled={deleteLoading}>
                                                                {deleteLoading ? (
                                                                    <>
                                                                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                                                        Deleting...
                                                                    </>
                                                                ) : (
                                                                    "Delete"
                                                                )}
                                                            </AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                            <TableFooter>
                                <TableRow>
                                    <TableCell colSpan={5}>Total {documents.length} documents</TableCell>
                                </TableRow>
                            </TableFooter>
                        </Table>
                    </div>

                    <div className="md:hidden grid gap-4">
                        {documents.map((doc) => (
                            <div key={doc.id} className="border rounded-md p-4">
                                <div className="flex items-center mb-2">
                                    {getFileIcon(doc.type)}
                                    <span className="font-semibold">{doc.name}</span>
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    <div>Type: {doc.type}</div>
                                    {/* @ts-ignore */}
                                    <div>Size: {formatFileSize(doc.fileSize)}</div>
                                    {/* @ts-ignore */}
                                    <div>Uploaded At: {formatDate(doc.createdAt)}</div>
                                </div>
                                <div className="flex justify-end gap-2 border-t pt-3">
                                    <Button variant="outline" size="sm" onClick={() => handlePreview(doc)}>
                                        <Eye className="h-4 w-4 mr-1" />
                                        View
                                    </Button>
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
                                                <AlertDialogAction onClick={handleDelete} disabled={deleteLoading}>
                                                    {deleteLoading ? (
                                                        <>
                                                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                                            Deleting...
                                                        </>
                                                    ) : (
                                                        "Delete"
                                                    )}
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}

            <Dialog open={previewDialogOpen} onOpenChange={setPreviewDialogOpen}>
                <DialogContent className="sm:max-w-[625px]">
                    <DialogHeader>
                        <DialogTitle>Document Preview</DialogTitle>
                        <DialogDescription>{previewDocument?.name}</DialogDescription>
                    </DialogHeader>
                    {previewDocument && <iframe src={previewDocument.url} className="w-full h-[600px]" />}
                    <DialogFooter>
                        <Button onClick={() => setPreviewDialogOpen(false)}>Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default DocumentManager

