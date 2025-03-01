// components/admin/VerifyKYCModal.tsx

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useState } from "react"
import { IKYCSubmission } from "@/app/api/models/KYCSubmission"
import { KYCDocument } from "@/lib/types"

interface Props {
    open: boolean
    onClose: () => void
    submission: IKYCSubmission | null
    onVerify: (submissionId: string, status: "APPROVED" | "REJECTED", rejectionReason?: string) => void
    documents: KYCDocument[] | null
}

const VerifyKYCModal: React.FC<Props> = ({ open, onClose, submission, onVerify, documents }) => {
    const [status, setStatus] = useState<"APPROVED" | "REJECTED">("APPROVED")
    const [rejectionReason, setRejectionReason] = useState<string>("")

    const handleVerify = () => {
        if (!submission) return

        onVerify(submission.userId, status, rejectionReason)
    }

    return (
        <Dialog open={open} onOpenChange={onClose}>
            {submission && (
                <DialogContent className="w-full max-w-md rounded-2xl sm:max-w-lg mx-auto max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Verify KYC Submission</DialogTitle>
                        <DialogDescription>User: {submission.fullName}</DialogDescription>
                    </DialogHeader>

                    {documents && documents.length > 0 ? (
                        <div className="grid gap-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="status">Status</Label>
                                <RadioGroup defaultValue={status} onValueChange={(value) => setStatus(value as "APPROVED" | "REJECTED")}>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="APPROVED" id="r1" />
                                        <Label htmlFor="r1">Approve</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="REJECTED" id="r2" />
                                        <Label htmlFor="r2">Reject</Label>
                                    </div>
                                </RadioGroup>
                            </div>

                            {status === "REJECTED" && (
                                <div className="space-y-2">
                                    <Label htmlFor="rejectionReason">Rejection Reason</Label>
                                    <Input
                                        id="rejectionReason"
                                        value={rejectionReason}
                                        onChange={(e) => setRejectionReason(e.target.value)}
                                    />
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="text-center py-4">No documents available for verification.</div>
                    )}

                    {documents && documents.length > 0 ? (
                        <Button type="submit" onClick={handleVerify}>
                            Submit
                        </Button>
                    ) : (
                        <Button type="submit" onClick={onClose}>
                            Close
                        </Button>
                    )}
                </DialogContent>
            )}
        </Dialog>
    )
}

export default VerifyKYCModal