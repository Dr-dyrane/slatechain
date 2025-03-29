import type { ColumnDef } from "@tanstack/react-table"
import { type User, UserRole, KYCStatus, OnboardingStatus } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export const Columns: ColumnDef<User>[] = [
    // {
    //     accessorKey: "avatarUrl",
    //     header: "Avatar",
    //     cell: ({ row }) => (
    //         <Avatar>
    //             <AvatarImage src={row.original.avatarUrl} alt={`${row.original.firstName} ${row.original.lastName}`} />
    //             <AvatarFallback>
    //                 {row.original.firstName[0]}
    //                 {row.original.lastName[0]}
    //             </AvatarFallback>
    //         </Avatar>
    //     ),
    // },
    {
        accessorKey: "name",
        header: "Name",
    },
    {
        accessorKey: "email",
        header: "Email",
        cell: ({ row }) => (
            <div className="truncate" title={row.original.email}>
                {row.original.email}
            </div>
        ),
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
        cell: ({ row }) => <Badge variant={getBadgeVariantForRole(row.original.role)}>{row.original.role}</Badge>,
    },
    {
        accessorKey: "kycStatus",
        header: "KYC Status",
        cell: ({ row }) => (
            <Badge variant={getBadgeVariantForKYCStatus(row.original.kycStatus)}>{row.original.kycStatus}</Badge>
        ),
    },
    {
        accessorKey: "onboardingStatus",
        header: "Onboarding Status",
        cell: ({ row }) => (
            <Badge variant={getBadgeVariantForOnboardingStatus(row.original.onboardingStatus)}>
                {row.original.onboardingStatus}
            </Badge>
        ),
    },
]

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

