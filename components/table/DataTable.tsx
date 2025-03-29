// src/components/DataTable.tsx
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

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ListCard } from "./List-card"
import { DataTablePagination } from "./DataTablePagination"
import { DataDetailsModal } from "@/components/table/DataDetailsModal"
import { DataTableToolbar } from "./DataTableToolbar"
import { exportToCSV } from "@/lib/utils"

interface DataRow {
    id: string
    [key: string]: any
}

interface DataTableProps<TData extends DataRow> {
    columns: ColumnDef<TData, any>[]
    data: TData[]
    onEdit?: (item: any) => void
    onDelete?: (item: any) => void
    exportFilename?: string
    searchKey?: string
}

export function DataTable<TData extends DataRow>({
    columns,
    data,
    onEdit,
    onDelete,
    exportFilename = "export.csv",
    searchKey = "name",
}: DataTableProps<TData>) {
    const [sorting, setSorting] = React.useState<SortingState>([])
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
    const [rowSelection, setRowSelection] = React.useState({})
    const [selectedRow, setSelectedRow] = React.useState<TData | null>(null)

    const table = useReactTable({
        data,
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

    const handleRowClick = (row: TData) => {
        setSelectedRow(row)
    }

    const handleCloseModal = () => {
        setSelectedRow(null)
    }

    // Extract column definitions for CSV export
    const exportColumns = columns
        .map((col) => ({
            accessorKey: typeof col.accessorKey === "string" ? col.accessorKey : "",
            header: typeof col.header === "string" ? col.header : col.id || "",
        }))
        .filter((col) => col.accessorKey)

    // Function to export selected rows
    const handleExportSelected = () => {
        const selectedRows = table.getFilteredSelectedRowModel().rows.map((row) => row.original)
        exportToCSV(selectedRows, exportColumns, exportFilename)
    }

    return (
        <div className="w-full space-y-4">
            <DataTableToolbar
                table={table}
                data={data}
                columns={exportColumns}
                searchKey={searchKey}
                exportFilename={exportFilename}
            />

            <div className="block sm:hidden">
                <ListCard
                    columns={columns}
                    data={table.getRowModel().rows.map((row) => row.original)}
                    onEdit={onEdit}
                    onDelete={onDelete}
                />
            </div>

            <div className="rounded-md border hidden sm:block">
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
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                    onClick={() => handleRowClick(row.original)}
                                    className="cursor-pointer"
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    No results.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <DataTablePagination table={table} />
            <DataDetailsModal
                open={!!selectedRow}
                onClose={handleCloseModal}
                columns={columns}
                data={selectedRow}
                title={selectedRow?.name}
                onEdit={onEdit}
                onDelete={onDelete}
            />
        </div>
    )
}

