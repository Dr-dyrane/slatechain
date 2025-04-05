"use client"
import { DocumentManager } from "../shared/DocumentManager"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { addSupplierDocument } from "@/lib/slices/supplierSlice"
import { useAppDispatch } from "@/lib/store"


interface DocumentsProps {
    documents: any[]
    onUploadDocument: (file: File, documentType?: string) => void
    onDeleteDocument: (documentId: string) => void
    isLoading?: boolean
}

export function Documents({
    documents,
    onUploadDocument,
    onDeleteDocument,
    isLoading = false,
}: DocumentsProps) {
    const { toast } = useToast()
    const dispatch = useAppDispatch()

    return (
        <Card>
            <CardHeader>
                <CardTitle>Document Management</CardTitle>
            </CardHeader>
            <CardContent>
                <DocumentManager
                    documents={documents}
                    onUploadDocument={onUploadDocument}
                    onDeleteDocument={onDeleteDocument}
                    isLoading={isLoading}
                    documentTypes={["CONTRACT", "CERTIFICATE", "INSURANCE", "COMPLIANCE", "OTHER"]}
                    emptyStateMessage="You haven't uploaded any documents yet."
                />
            </CardContent>
        </Card>
    )
}

