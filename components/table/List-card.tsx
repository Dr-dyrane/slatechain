// src/components/table/List-card.tsx
"use client";

import * as React from "react";
import {
    ColumnDef,
} from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { ChevronRight, Download } from 'lucide-react'
import { TouchableOpacity } from "@/components/ui/touchable-opacity"
import { Avatar } from "@/components/ui/avatar"
import { DataDetailsModal } from "@/components/table/DataDetailsModal"
import { Card, CardContent, CardFooter } from "../ui/card";
import { exportToCSV } from "@/lib/utils";


interface DataRow {
    id: string;
    name?: string;
    [key: string]: any;
}

interface ListCardProps<TData extends DataRow, TValue> {
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
    onEdit?: (item: any) => void;
    onDelete?: (item: any) => void;
}

export function ListCard<TData extends DataRow, TValue>({
    columns,
    data, onEdit, onDelete
}: ListCardProps<TData, TValue>) {
    const [selectedItem, setSelectedItem] = React.useState<TData | null>(null);

    const handleItemClick = (item: TData) => {
        setSelectedItem(item);
    };

    const handleCloseModal = () => {
        setSelectedItem(null)
    };

    const getAvatarContent = (item: TData) => {
        const firstColumn = columns[0]
        const value = firstColumn.accessorKey ? item[firstColumn.accessorKey as string] : '';
        return typeof value === 'string' ? value.charAt(0).toUpperCase() : '?'
    }

    const renderValue = (column: ColumnDef<TData, TValue>, item: TData) => {
        if (column.cell && typeof column.cell === 'function') {
            return column.cell({ row: { original: item, getValue: (key: string) => item[key] } })
        }
        return column.accessorKey ? item[column.accessorKey as string] : '';
    };

    // Extract column definitions for CSV export
    const exportColumns = columns
        .map((col) => ({
            accessorKey: typeof col.accessorKey === "string" ? col.accessorKey : "",
            header: typeof col.header === "string" ? col.header : col.id || "",
        }))
        .filter((col) => col.accessorKey)

    // Function to export all data
    const handleExport = () => {
        exportToCSV(data, exportColumns, "export.csv")
    }

    return (
        <>
            <div className="space-y-4">
                {data.map((item, index) => (
                    <TouchableOpacity key={index} onClick={() => handleItemClick(item)}>
                        <Card className="mb-2">
                            <CardContent className="py-4 px-2 flex items-center justify-between gap-1.5">
                                <Avatar className="bg-muted">
                                    {getAvatarContent(item)}
                                </Avatar>
                                <div className="flex-grow max-w-[96px]">
                                    <div className="font-semibold truncate">
                                        {renderValue(columns[0], item)}
                                    </div>
                                    <div className="text-xs text-muted-foreground break-words overflow-wrap truncate">
                                        {renderValue(columns[1], item)}
                                    </div>
                                </div>

                                {columns.slice(2, 4).map((column, colIndex) => (
                                    <div
                                        key={colIndex}
                                        className="text-sm text-right mr-1 break-words overflow-wrap truncate"
                                    >
                                        {renderValue(column, item)}
                                    </div>
                                ))}
                                <ChevronRight className="h-5 w-5 text-muted-foreground" />
                            </CardContent>
                        </Card>
                    </TouchableOpacity>
                ))}
                {data.length > 0 && (
                    <CardFooter className="pt-2 px-0">
                        <Button variant="outline" size="sm" className="ml-auto" onClick={handleExport}>
                            <Download className="mr-2 h-4 w-4" />
                            Export to CSV
                        </Button>
                    </CardFooter>
                )}
            </div>
            <DataDetailsModal open={!!selectedItem} onClose={handleCloseModal} columns={columns} data={selectedItem} title={selectedItem?.name || ''} onEdit={onEdit}
                onDelete={onDelete} />
        </>
    )
}