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
    type Row,
} from "@tanstack/react-table"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ListCard } from "./List-card"
import { DataTablePagination } from "./DataTablePagination"
import { DataDetailsModal } from "@/components/table/DataDetailsModal"
import { DataTableToolbar } from "./DataTableToolbar"
import { exportToCSV } from "@/lib/utils"
import { Checkbox } from "@/components/ui/checkbox"

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
    const [rowSelection, setRowSelection] = React.useState<Record<string, boolean>>({}) // change to Record<string, boolean>
    const [selectedRow, setSelectedRow] = React.useState<TData | null>(null)

    const table = useReactTable({
        data,
        columns: [
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
            ...columns,
        ],
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

    const handleRowClick = (event: React.MouseEvent<HTMLTableRowElement>, row: TData) => {
        // Prevent modal from opening if the click originated from the "select" column
        if ((event.target as HTMLElement).closest('[data-column-id="select"]')) {
            return;
        }
        setSelectedRow(row);
    };

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
                onExportSelected={handleExportSelected} // Pass the export function
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
                                    onClick={(event) => handleRowClick(event, row.original)}
                                    className="cursor-pointer"
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id} data-column-id={cell.column.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
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

