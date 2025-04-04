"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { SupplierDocument } from "@/lib/types"
import { FileText, Download, Trash2, Upload, File, FileImage, FileArchive, FileSpreadsheet } from "lucide-react"
import { format } from "date-fns"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface DocumentsProps {
    documents: SupplierDocument[]
    onUploadDocument: (file: File) => void
    onDeleteDocument: (documentId: string) => void
}

export function Documents({ documents, onUploadDocument, onDeleteDocument }: DocumentsProps) {
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [documentToDelete, setDocumentToDelete] = useState<SupplierDocument | null>(null)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0])
        }
    }

    const handleUpload = () => {
        if (selectedFile) {
            onUploadDocument(selectedFile)
            setSelectedFile(null)
            setUploadDialogOpen(false)
        }
    }

    const handleDelete = () => {
        if (documentToDelete) {
            onDeleteDocument(documentToDelete.id)
            setDocumentToDelete(null)
            setDeleteDialogOpen(false)
        }
    }

    const getFileIcon = (type: string) => {
        if (type.includes("image")) return <FileImage className="h-5 w-5" />
        if (type.includes("pdf")) return <FileText className="h-5 w-5" />
        if (type.includes("spreadsheet") || type.includes("excel")) return <FileSpreadsheet className="h-5 w-5" />
        if (type.includes("zip") || type.includes("compressed")) return <FileArchive className="h-5 w-5" />
        return <File className="h-5 w-5" />
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Document Management</CardTitle>
                    <CardDescription>Manage your documents and files</CardDescription>
                </div>
                <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Upload className="h-4 w-4 mr-2" />
                            Upload Document
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Upload Document</DialogTitle>
                            <DialogDescription>Upload a new document to your supplier profile</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="file">Select File</Label>
                                <Input id="file" type="file" onChange={handleFileChange} />
                            </div>
                            {selectedFile && (
                                <Alert>
                                    <FileText className="h-4 w-4" />
                                    <AlertDescription>
                                        Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)
                                    </AlertDescription>
                                </Alert>
                            )}
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setUploadDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleUpload} disabled={!selectedFile}>
                                Upload
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </CardHeader>
            <CardContent>
                {documents.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-40 text-center p-4">
                        <FileText className="h-10 w-10 text-muted-foreground mb-2" />
                        <p className="text-muted-foreground">No documents yet</p>
                        <p className="text-sm text-muted-foreground">Upload your first document using the button above</p>
                    </div>
                ) : (
                    <ScrollArea className="h-[400px] pr-4">
                        <div className="space-y-2">
                            {documents.map((doc) => (
                                <div key={doc.id} className="flex items-center justify-between p-3 border rounded-md">
                                    <div className="flex items-center">
                                        <div className="bg-primary/10 p-2 rounded-full mr-3">{getFileIcon(doc.type)}</div>
                                        <div>
                                            <p className="text-sm font-medium">{doc.name}</p>
                                            <p className="text-xs text-muted-foreground">
                                                Uploaded: {format(new Date(doc.uploadedAt), "MMM d, yyyy")}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex space-x-2">
                                        <Button variant="ghost" size="icon" asChild>
                                            <a href={doc.url} target="_blank" rel="noopener noreferrer" download>
                                                <Download className="h-4 w-4" />
                                            </a>
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => {
                                                setDocumentToDelete(doc)
                                                setDeleteDialogOpen(true)
                                            }}
                                        >
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                )}
            </CardContent>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirm Deletion</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this document? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        {documentToDelete && (
                            <Alert>
                                <FileText className="h-4 w-4" />
                                <AlertDescription>{documentToDelete.name}</AlertDescription>
                            </Alert>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDelete}>
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Card>
    )
}

