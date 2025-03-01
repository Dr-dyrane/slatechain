import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { IKYCSubmission } from "@/app/api/models/KYCSubmission";
import { format } from "date-fns";
import { Eye, ShieldCheck, Signature, View } from "lucide-react";

interface Props {
    submissions: IKYCSubmission[];
    onViewDocument: (submission: IKYCSubmission) => void;
    onVerify: (submission: IKYCSubmission) => void;
    isLoading: boolean;
}

const statusVariants: Record<string, "default" | "success" | "destructive" | "warning"> = {
    PENDING: "warning",
    APPROVED: "success",
    REJECTED: "destructive",
};

const PendingKYCSubmissionsTable: React.FC<Props> = ({
    submissions,
    onViewDocument,
    onVerify,
    isLoading,
}) => {
    return (
        <div className="w-full">
            {/* Mobile List View */}
            <div className="block md:hidden space-y-4">
                {isLoading
                    ? Array.from({ length: 5 }).map((_, index) => (
                        <Skeleton key={index} className="h-20 w-full rounded-lg" />
                    ))
                    : submissions.map((submission) => (
                        <div
                            key={submission.userId}
                            className="bg-muted p-4 rounded-lg shadow-sm border"
                        >
                            <p className="text-sm font-semibold">{submission.fullName}</p>
                            <p className="text-xs text-muted-foreground">
                                {submission.role}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {submission.createdAt
                                    ? format(new Date(submission.createdAt), "yyyy-MM-dd HH:mm")
                                    : "N/A"}
                            </p>
                            <div className="flex justify-between mt-2">
                                <Badge variant={statusVariants[submission.status] || "default"}>
                                    {submission.status}
                                </Badge>
                                <div className="flex justify-end gap-2">
                                    <Button variant="outline" size="sm" onClick={() => onViewDocument(submission)}>
                                        View
                                    </Button>
                                    <Button size="sm" onClick={() => onVerify(submission)}>
                                        Verify
                                    </Button>
                                </div>

                            </div>
                        </div>
                    ))}
            </div>

            {/* Table View for Medium Screens and Above */}
            <div className="hidden md:block overflow-x-auto">
                <table className="min-w-full border border-muted rounded-lg">
                    <thead className="bg-muted">
                        <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground capitalize">
                                User ID
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground capitalize">
                                Full Name
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground capitalize hidden lg:table-cell">
                                Status
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground capitalize">
                                Submitted At
                            </th>
                            <th className="px-4 py-2 text-right text-xs font-medium text-muted-foreground capitalize">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading
                            ? Array.from({ length: 5 }).map((_, index) => (
                                <tr key={index} className="border-b">
                                    <td colSpan={5} className="px-4 py-2">
                                        <Skeleton className="h-10 w-full rounded-lg" />
                                    </td>
                                </tr>
                            ))
                            : submissions.map((submission) => (
                                <tr key={submission.userId} className="border-b hover:bg-accent">
                                    <td className="px-4 py-2 text-sm max-w-32 truncate">{submission.userId}</td>
                                    <td className="px-4 py-2 text-sm">{submission.fullName}</td>
                                    <td className="px-4 py-2 text-sm hidden lg:table-cell">
                                        <Badge variant={statusVariants[submission.status] || "default"}>
                                            {submission.status}
                                        </Badge>
                                    </td>
                                    <td className="px-4 py-2 text-sm">
                                        {submission.createdAt
                                            ? format(new Date(submission.createdAt), "yyyy-MM-dd HH:mm")
                                            : "N/A"}
                                    </td>
                                    <td className="px-4 py-2 text-right flex gap-2 items-center justify-end">
                                        <Button variant="outline" size="sm" onClick={() => onViewDocument(submission)}>
                                            <span className="hidden lg:flex mr-2">View</span>
                                            <Eye />
                                        </Button>
                                        <Button size="sm" onClick={() => onVerify(submission)}>
                                            <span className="hidden lg:flex mr-2">Verify</span>
                                            <Signature />
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default PendingKYCSubmissionsTable;
