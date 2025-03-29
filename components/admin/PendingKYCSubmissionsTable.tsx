"use client"

import * as React from "react"
import {
    type ColumnDef,
    type ColumnFiltersState,
    type SortingState,
    type VisibilityState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DataTablePagination } from "@/components/table/DataTablePagination"
import { DataDetailsModal } from "@/components/table/DataDetailsModal"
import { DataTableToolbar } from "@/components/table/DataTableToolbar"
import { exportToCSV } from "@/lib/utils"
import type { IKYCSubmission } from "@/app/api/models/KYCSubmission"
import { format } from "date-fns"
import { Eye, FilePenLineIcon as Signature } from "lucide-react"

interface PendingKYCSubmissionsTableProps {
    submissions: IKYCSubmission[]
    onViewDocument: (submission: IKYCSubmission) => void
    onVerify: (submission: IKYCSubmission) => void
    isLoading: boolean
}

const statusVariants: Record<string, "default" | "success" | "destructive" | "warning"> = {
    PENDING: "warning",
    APPROVED: "success",
    REJECTED: "destructive",
}

const PendingKYCSubmissionsTable: React.FC<PendingKYCSubmissionsTableProps> = ({
    submissions,
    onViewDocument,
    onVerify,
    isLoading,
}) => {
    // State for table functionality
    const [sorting, setSorting] = React.useState<SortingState>([])
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
    const [rowSelection, setRowSelection] = React.useState<Record<string, boolean>>({})
    const [selectedSubmission, setSelectedSubmission] = React.useState<IKYCSubmission | null>(null)

    // Define columns for the table
    const columns: ColumnDef<IKYCSubmission>[] = [
        {
            id: "select",
            header: ({ table }) => (
                <Checkbox
                    className="cursor-pointer border-muted"
                    checked={table.getIsAllPageRowsSelected()}
                    onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                    aria-label="Select all"
                />
            ),
            cell: ({ row }) => (
                <Checkbox
                    className="cursor-pointer border-muted-foreground"
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                    aria-label="Select row"
                />
            ),
            enableSorting: false,
            enableHiding: false,
        },
        {
            accessorKey: "userId",
            header: "ID",
            cell: ({ row }) => <div className="max-w-32 truncate">{row.getValue("userId")}</div>,
        },
        {
            accessorKey: "fullName",
            header: "Full Name",
            cell: ({ row }) => <div>{row.getValue("fullName")}</div>,
        },
        {
            accessorKey: "role",
            header: "Role",
            cell: ({ row }) => <div>{row.getValue("role")}</div>,
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => {
                const status = row.getValue("status") as string
                return <Badge variant={statusVariants[status] || "default"}>{status}</Badge>
            },
        },
        {
            accessorKey: "createdAt",
            header: "Submitted At",
            cell: ({ row }) => {
                const date = row.getValue("createdAt") as string
                return date ? format(new Date(date), "yyyy-MM-dd HH:mm") : "N/A"
            },
        },
        {
            id: "actions",
            header: "Actions",
            cell: ({ row }) => {
                const submission = row.original
                return (
                    <div className="flex gap-2 items-center justify-end">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                                e.stopPropagation()
                                onViewDocument(submission)
                            }}
                        >
                            <span className="hidden lg:flex mr-2">View</span>
                            <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                            size="sm"
                            onClick={(e) => {
                                e.stopPropagation()
                                onVerify(submission)
                            }}
                        >
                            <span className="hidden lg:flex mr-2">Verify</span>
                            <Signature className="h-4 w-4" />
                        </Button>
                    </div>
                )
            },
        },
    ]

    // Initialize the table
    const table = useReactTable({
        data: submissions,
        columns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
        },
    })

    // Handle row click to show details modal
    const handleRowClick = (event: React.MouseEvent<HTMLTableRowElement>, submission: IKYCSubmission) => {
        // Prevent modal from opening if the click originated from the "select" column or actions column
        if (
            (event.target as HTMLElement).closest('[data-column-id="select"]') ||
            (event.target as HTMLElement).closest('[data-column-id="actions"]')
        ) {
            return
        }
        setSelectedSubmission(submission)
    }

    // Handle closing the details modal
    const handleCloseModal = () => {
        setSelectedSubmission(null)
    }

    // Extract column definitions for CSV export
    const exportColumns = columns
        .filter((col) => col.id !== "select" && col.id !== "actions")
        .map((col) => ({
            accessorKey: typeof col.accessorKey === "string" ? col.accessorKey : "",
            header: typeof col.header === "string" ? col.header : col.id || "",
        }))
        .filter((col) => col.accessorKey)

    // Function to export selected rows
    const handleExportSelected = () => {
        const selectedRows = table.getFilteredSelectedRowModel().rows.map((row) => row.original)
        exportToCSV(selectedRows, exportColumns, "kyc-submissions.csv")
    }

    return (
        <div className="w-full space-y-4">
            {/* Toolbar with search, export, and column visibility */}
            <DataTableToolbar
                table={table}
                data={submissions}
                columns={exportColumns}
                searchKey="fullName"
                exportFilename="kyc-submissions.csv"
                onExportSelected={handleExportSelected}
            />

            {/* Mobile List View - Restored original styling */}
            <div className="block md:hidden space-y-4">
                {isLoading
                    ? Array.from({ length: 5 }).map((_, index) => <Skeleton key={index} className="h-20 w-full rounded-lg" />)
                    : table.getRowModel().rows.map((row) => {
                        const submission = row.original
                        return (
                            <div key={submission.userId} className="flex flex-row w-full justify-between items-center bg-muted p-4 rounded-lg shadow-sm border">
                                <div className="flex flex-col items-start justify-start text-left h-full w-full">
                                    <Checkbox
                                        className="cursor-pointer border-muted-foreground mb-3"
                                        checked={row.getIsSelected()}
                                        onCheckedChange={(value) => row.toggleSelected(!!value)}
                                        aria-label="Select row"
                                    />
                                    <p className="text-md font-semibold">{submission.fullName}</p>
                                    <p className="text-sm text-muted-foreground">{submission.role}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {submission.createdAt ? format(new Date(submission.createdAt), "yyyy-MM-dd HH:mm") : "N/A"}
                                    </p>
                                </div>

                                <div className="flex flex-col items-end justify-between text-right h-full">
                                    <Badge variant={statusVariants[submission.status] || "default"}>{submission.status}</Badge>

                                    <div className="flex justify-between mt-4">
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

                            </div>
                        )
                    })}
            </div>

            {/* Table View for Medium Screens and Above */}
            <div className="hidden md:block overflow-x-auto">
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => (
                                        <TableHead key={header.id}>
                                            {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                        </TableHead>
                                    ))}
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                Array.from({ length: 5 }).map((_, index) => (
                                    <TableRow key={index}>
                                        <TableCell colSpan={columns.length} className="h-16">
                                            <Skeleton className="h-8 w-full" />
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : table.getRowModel().rows.length > 0 ? (
                                table.getRowModel().rows.map((row) => (
                                    <TableRow
                                        key={row.id}
                                        data-state={row.getIsSelected() && "selected"}
                                        onClick={(event) => handleRowClick(event, row.original)}
                                        className="cursor-pointer"
                                    >
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell key={cell.id} data-column-id={cell.column.id}>
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={columns.length} className="h-24 text-center">
                                        No KYC submissions found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* Pagination Controls */}
            <DataTablePagination table={table} />

            {/* Details Modal */}
            <DataDetailsModal
                open={!!selectedSubmission}
                onClose={handleCloseModal}
                columns={columns.filter((col) => col.id !== "select" && col.id !== "actions")}
                data={selectedSubmission}
                title={selectedSubmission?.fullName || "KYC Submission Details"}
                onEdit={(submission) => onVerify(submission)}
            />
        </div>
    )
}

export default PendingKYCSubmissionsTable
