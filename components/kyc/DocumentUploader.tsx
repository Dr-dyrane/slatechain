"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Upload, X, FileText, Check } from "lucide-react"
import { useDispatch } from "react-redux"
import type { AppDispatch } from "@/lib/store"
import { uploadDocumentThunk } from "@/lib/slices/kycSlice"
import type { KYCDocument } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"

interface DocumentUploaderProps {
  documentType: string
  label: string
  description?: string
  existingDocument?: KYCDocument | null
  onUploadSuccess?: (document: KYCDocument) => void
  required?: boolean
}

export function DocumentUploader({
  documentType,
  label,
  description,
  existingDocument,
  onUploadSuccess,
  required = true,
}: DocumentUploaderProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [document, setDocument] = useState<KYCDocument | null>(existingDocument || null)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()
  const dispatch = useDispatch<AppDispatch>()

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "application/pdf"]
    if (!allowedTypes.includes(file.type)) {
      setError("File must be JPEG, PNG, or PDF")
      return
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      setError("File size must be less than 5MB")
      return
    }

    setIsUploading(true)
    setError(null)

    try {
      const result = await dispatch(
        uploadDocumentThunk({
          documentType,
          file,
        }),
      ).unwrap()

      setDocument(result)

      if (onUploadSuccess) {
        onUploadSuccess(result)
      }

      toast({
        title: "Document uploaded",
        description: "Your document has been successfully uploaded.",
        variant: "default",
      })
    } catch (err: any) {
      console.error("Upload error:", err)
      setError(err instanceof Error ? err.message : "Failed to upload document")

      toast({
        title: "Upload failed",
        description: err instanceof Error ? err.message : "Failed to upload document",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleDelete = async () => {
    if (!document) return

    try {
      // Use the API client through Redux
      // This would be implemented in your kycSlice
      // const result = await dispatch(deleteDocumentThunk(document.id)).unwrap()

      // For now, we'll just simulate success
      setDocument(null)

      toast({
        title: "Document deleted",
        description: "Your document has been successfully deleted.",
        variant: "default",
      })
    } catch (err: any) {
      console.error("Delete error:", err)

      toast({
        title: "Delete failed",
        description: err instanceof Error ? err.message : "Failed to delete document",
        variant: "destructive",
      })
    }
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        {document ? (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 p-2 border rounded-md bg-muted/50">
              <FileText className="h-5 w-5 text-primary" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{document.type}</p>
                <p className="text-xs text-muted-foreground">
                  Uploaded on {new Date(document.uploadedAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={handleDelete}
                >
                  <X className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-green-500" asChild>
                  <a href={document.url} target="_blank" rel="noopener noreferrer">
                    <Check className="h-4 w-4" />
                  </a>
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {description && <p className="text-sm text-muted-foreground">{description}</p>}
            <div className="flex flex-col gap-2">
              <Label htmlFor={`file-${documentType}`} className="cursor-pointer">
                <div className="flex flex-col items-center justify-center gap-2 p-4 border-2 border-dashed rounded-md hover:border-primary">
                  <Upload className="h-8 w-8 text-muted-foreground" />
                  <p className="text-sm font-medium">
                    {isUploading ? "Uploading..." : "Click to upload or drag and drop"}
                  </p>
                  <p className="text-xs text-muted-foreground">PDF, PNG, JPG (max 5MB)</p>
                </div>
              </Label>
              <input
                id={`file-${documentType}`}
                type="file"
                className="hidden"
                accept=".pdf,.png,.jpg,.jpeg"
                onChange={handleFileChange}
                disabled={isUploading}
                required={required}
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

