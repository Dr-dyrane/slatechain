// components/admin/ViewKYCSubmissionModal.tsx

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useEffect } from "react"
import { KYCDocument } from "@/lib/types" // Import KYCDocument type
import { IKYCSubmission } from "@/app/api/models/KYCSubmission" // Import IKYCSubmission

interface Props {
    open: boolean
    onClose: () => void
    submission: IKYCSubmission | null
    documents: KYCDocument[] | null
}

const ViewKYCSubmissionModal: React.FC<Props> = ({ open, onClose, submission, documents }) => {
    useEffect(() => {
        if (!open) {
            // Reset selected document when the modal is closed
        }
    }, [open])

    if (!submission) return null

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="w-full max-w-md rounded-2xl sm:max-w-lg mx-auto max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>View KYC Submission</DialogTitle>
                    <DialogDescription>User: {submission.fullName}</DialogDescription>
                </DialogHeader>

                <div>
                    {documents && documents.length > 0 ? (
                        documents.map((document) => (
                            <div key={document.id} className="mb-4">
                                <h4 className="font-semibold">Document Type: {document.type}</h4>
                                {document.url?.toLowerCase().endsWith(".pdf") ? (
                                    <iframe src={document.url} width="100%" height="500px" />
                                ) : (
                                    <img src={document.url} alt={document.type} className="max-w-full" />
                                )}
                            </div>
                        ))
                    ) : (
                        <p>No documents found for this submission.</p>
                    )}
                </div>

                <Button type="submit" onClick={onClose}>
                    Close
                </Button>
            </DialogContent>
        </Dialog>
    )
}

export default ViewKYCSubmissionModal