"use client"

import { useState, useEffect } from "react"
import { DocumentUploader } from "./DocumentUploader"
import { type KYCDocument, UserRole } from "@/lib/types"
import { useSelector } from "react-redux"
import type { RootState } from "@/lib/store"

interface KYCDocumentsSectionProps {
  documents: KYCDocument[]
  onDocumentsChange?: (documents: KYCDocument[]) => void
}

export function KYCDocumentsSection({ documents: initialDocuments = [], onDocumentsChange }: KYCDocumentsSectionProps) {
  const [documents, setDocuments] = useState<KYCDocument[]>(initialDocuments)
  const { user } = useSelector((state: RootState) => state.auth)

  useEffect(() => {
    setDocuments(initialDocuments)
  }, [initialDocuments])

  const handleDocumentUpload = (newDocument: KYCDocument) => {
    const updatedDocuments = [...documents.filter((doc) => doc.type !== newDocument.type), newDocument]
    setDocuments(updatedDocuments)

    if (onDocumentsChange) {
      onDocumentsChange(updatedDocuments)
    }
  }

  const getDocumentByType = (type: string) => {
    return documents.find((doc) => doc.type === type) || null
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Required Documents</h3>

      <div className="grid gap-6 md:grid-cols-2">
        <DocumentUploader
          documentType="ID_DOCUMENT"
          label="Identity Document"
          description="Upload a government-issued ID (passport, driver's license, etc.)"
          existingDocument={getDocumentByType("ID_DOCUMENT")}
          onUploadSuccess={handleDocumentUpload}
        />

        {user?.role === UserRole.SUPPLIER && (
          <DocumentUploader
            documentType="TAX_DOCUMENT"
            label="Tax Document"
            description="Upload a business tax document or registration certificate"
            existingDocument={getDocumentByType("TAX_DOCUMENT")}
            onUploadSuccess={handleDocumentUpload}
          />
        )}

        <DocumentUploader
          documentType="ADDRESS_PROOF"
          label="Proof of Address"
          description="Upload a utility bill, bank statement, or other proof of address"
          existingDocument={getDocumentByType("ADDRESS_PROOF")}
          onUploadSuccess={handleDocumentUpload}
          required={false}
        />

        {user?.role === UserRole.SUPPLIER && (
          <DocumentUploader
            documentType="BUSINESS_LICENSE"
            label="Business License"
            description="Upload your business license or registration document"
            existingDocument={getDocumentByType("BUSINESS_LICENSE")}
            onUploadSuccess={handleDocumentUpload}
            required={false}
          />
        )}
      </div>
    </div>
  )
}

