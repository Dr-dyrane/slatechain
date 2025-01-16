"use client";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { ColumnDef } from "@tanstack/react-table";

interface DataDetailsModalProps<TData> {
    open: boolean;
    onClose: () => void;
    data: TData | null;
    title: string;
    columns: ColumnDef<TData, any>[];
}

export function DataDetailsModal<TData extends Record<string, any>>({
    open,
    onClose,
    data,
    columns,
    title,
}: DataDetailsModalProps<TData>) {
    const renderValue = (column: ColumnDef<TData, any>, item: TData) => {
        if (column.cell && typeof column.cell === "function") {
            return column.cell({
                row: { original: item, getValue: (key: string) => item[key] },
            });
        }
        return column.accessorKey ? item[column.accessorKey as string] : "";
    };

    return (
        <AlertDialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
            <AlertDialogContent
                className="rounded-lg shadow-lg ring-1 ring-secondary-foreground/70 hover:ring-4 hover:ring-secondary-foreground focus:ring-4 focus:ring-secondary-foreground transition-all duration-300 
                bg-gradient-to-br from-secondary to-muted dark:from-muted dark:to-secondary text-foreground"
            >
                <AlertDialogHeader className="p4 sm:p-6">
                    <AlertDialogTitle className="text-lg sm:text-2xl font-bold tracking-wide drop-shadow-md">
                        {title || "Row Details"}
                    </AlertDialogTitle>
                    <AlertDialogDescription className="mt-2 text-sm text-muted-foreground">
                        View the details of the selected row.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="space-y-2 sm:space-y-4 p-4 sm:p-6">
                    {data ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {columns.map((column, index) => (
                                <div key={index} className="flex flex-col">
                                    <span className="font-semibold text-sm text-muted-foreground">
                                        {column.header}:
                                    </span>
                                    <span className="font-medium text-secondary-foreground break-words">
                                        {renderValue(column, data)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-center text-muted-foreground">
                            No data available to display.
                        </p>
                    )}
                </div>
                <AlertDialogFooter className="p-6 border-t border-muted">
                    <AlertDialogCancel
                        className="px-4 py-2 text-sm font-medium text-secondary bg-secondary-foreground/80 rounded-lg hover:bg-secondary focus:ring focus:ring-secondary/70 transition-all"
                    >
                        Cancel
                    </AlertDialogCancel>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
