import type { ColumnDef } from "@tanstack/react-table"
import { type User, UserRole, KYCStatus, OnboardingStatus } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export const Columns: ColumnDef<User>[] = [
    {
        accessorKey: "name",
        header: "User",
        cell: ({ row }) => {
            const user = row.original;
            const firstName = user.firstName || "Unknown";
            const lastName = user.lastName || "User";
            const email = user.email || "No email";
            const avatarUrl = user.avatarUrl;

            return (
                <div className="flex items-center gap-3">
                    <Avatar className="flex-shrink-0 hidden sm:block">
                        <AvatarImage
                            src={avatarUrl}
                            alt={`${firstName} ${lastName}`}
                        />
                        <AvatarFallback>
                            {firstName[0]?.toUpperCase() || "U"}
                            {lastName[0]?.toUpperCase() || "N"}
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="font-medium text-sm text-wrap">
                            {firstName} {lastName}
                        </p>
                        <p className="text-xs text-gray-500 text-wrap">{email}</p>
                    </div>
                </div>
            );
        },
    },
    {
        accessorKey: "phoneNumber",
        header: "Phone Number",
        cell: ({ row }) => (
            <div className="truncate" title={row.original.phoneNumber}>
                {row.original.phoneNumber}
            </div>
        ),
    },
    {
        accessorKey: "role",
        header: "Role",
        cell: ({ row }) => (
            <Badge variant={getBadgeVariantForRole(row.original.role)}>
                {row.original.role?.charAt(0).toUpperCase() + row.original.role?.slice(1) || "N/A"}
            </Badge>
        ),
    },
    {
        accessorKey: "kycStatus",
        header: "KYC Status",
        cell: ({ row }) => (
            <Badge variant={getBadgeVariantForKYCStatus(row.original.kycStatus)}>
                {row.original.kycStatus || "Unknown"}
            </Badge>
        ),
    },
    {
        accessorKey: "onboardingStatus",
        header: "Onboarding Status",
        cell: ({ row }) => (
            <Badge variant={getBadgeVariantForOnboardingStatus(row.original.onboardingStatus)}>
                {row.original.onboardingStatus || "Pending"}
            </Badge>
        ),
    },
];

function getBadgeVariantForRole(role: UserRole) {
    switch (role) {
        case UserRole.ADMIN:
            return "success"
        case UserRole.SUPPLIER:
            return "secondary"
        case UserRole.MANAGER:
            return "outline"
        case UserRole.CUSTOMER:
            return "warning"
        default:
            return "success"
    }
}

function getBadgeVariantForKYCStatus(status: KYCStatus) {
    switch (status) {
        case KYCStatus.APPROVED:
            return "success"
        case KYCStatus.REJECTED:
            return "destructive"
        case KYCStatus.PENDING_REVIEW:
            return "warning"
        default:
            return "default"
    }
}

function getBadgeVariantForOnboardingStatus(status: OnboardingStatus) {
    switch (status) {
        case OnboardingStatus.COMPLETED:
            return "success"
        case OnboardingStatus.IN_PROGRESS:
            return "warning"
        case OnboardingStatus.NOT_STARTED:
            return "destructive"
        default:
            return "default"
    }
}

