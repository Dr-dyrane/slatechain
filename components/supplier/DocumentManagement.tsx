import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { SupplierDocument } from "@/lib/types"
import { FileText, Trash2 } from "lucide-react"

interface DocumentManagementProps {
  documents: SupplierDocument[]
  onUploadDocument: (file: File) => void
  onDeleteDocument: (documentId: string) => void
}

export function DocumentManagement({ documents, onUploadDocument, onDeleteDocument }: DocumentManagementProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0])
    }
  }

  const handleUpload = () => {
    if (selectedFile) {
      onUploadDocument(selectedFile)
      setSelectedFile(null)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Document Management</CardTitle>
        <CardDescription>Upload and manage supplier documents</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <Input type="file" onChange={handleFileChange} />
          <Button onClick={handleUpload} disabled={!selectedFile} className="mt-2">
            Upload Document
          </Button>
        </div>
        <div className="space-y-2">
          {documents.map((doc) => (
            <div key={doc.id} className="flex items-center justify-between p-2 bg-muted rounded-md">
              <div className="flex items-center">
                <FileText className="mr-2 h-4 w-4" />
                <span>{doc.name}</span>
              </div>
              <Button variant="ghost" size="sm" onClick={() => onDeleteDocument(doc.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

