// components/admin/PendingKYCSubmissionsTable.tsx
import { Button } from "@/components/ui/button"
import { IKYCSubmission } from "@/app/api/models/KYCSubmission"
import { KYCDocument } from "@/lib/types" // Import KYCDocument type
import { format } from "date-fns" // Import date-fns

interface Props {
    submissions: IKYCSubmission[]
    onViewDocument: (submission: IKYCSubmission) => void  // Modified type
    onVerify: (submission: IKYCSubmission) => void
}

const PendingKYCSubmissionsTable: React.FC<Props> = ({
    submissions,
    onViewDocument,
    onVerify,
}) => {
    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            User ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Full Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Submitted At
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Role
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {submissions.map((submission) => (
                        <tr key={submission.userId}>
                            <td className="px-6 py-4 whitespace-nowrap">{submission.userId}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{submission.fullName}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{submission.status}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                {submission.createdAt
                                    ? format(new Date(submission.createdAt), "yyyy-MM-dd HH:mm:ss")
                                    : "N/A"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">{submission.role}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                <Button variant="outline" size="sm" onClick={() => onViewDocument(submission)}>
                                    View Submission
                                </Button>
                                <Button size="sm" onClick={() => onVerify(submission)}>
                                    Verify
                                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

export default PendingKYCSubmissionsTable