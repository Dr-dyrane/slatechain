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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { Edit, MoreVertical, Trash } from "lucide-react";
import { ReactNode } from "react";

interface DataDetailsModalProps<TData> {
    open: boolean;
    onClose: () => void;
    data: TData | null;
    title: string;
    columns: ColumnDef<TData, any>[];
    onEdit?: (item: any) => void;
    onDelete?: (item: any) => void;
}

export function DataDetailsModal<TData extends Record<string, any>>({
    open,
    onClose,
    data,
    columns,
    title,
    onEdit, onDelete
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
                className="w-full max-w-md rounded-2xl sm:max-w-lg mx-auto max-h-[80vh] overflow-y-auto
                shadow-lg ring-1 ring-secondary-foreground/50 hover:ring-2 hover:ring-secondary-foreground focus:ring-2 focus:ring-secondary-foreground transition-all duration-300 
                bg-gradient-to-br from-secondary to-muted dark:from-muted dark:to-secondary text-foreground
                "
            >

                <AlertDialogHeader className="relative">
                    <AlertDialogTitle className="text-lg sm:text-2xl font-bold tracking-wide drop-shadow-md">
                        {title || "Row Details"}
                    </AlertDialogTitle>
                    <AlertDialogDescription className="mt-2 text-sm text-muted-foreground">
                        View the details of the selected row.
                    </AlertDialogDescription>

                    {/* Options Icon */}
                    {(onEdit || onDelete) && (<div className="absolute top-0 right-0">
                        <DropdownMenu>

                            <DropdownMenuTrigger asChild>
                                <button className="p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-primary/10 focus:outline-none focus:ring-2 focus:ring-primary/70 transition">
                                    <MoreVertical className="w-5 h-5" />
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-auto rounded-xl shadow-lg bg-primary/10 ring-1 ring-primary/10 py-4 px-2 focus:outline-none">
                                {onEdit && (<DropdownMenuItem onClick={() => {
                                    onEdit(data)
                                    onClose()
                                }}>
                                    <Edit className="w-4 h-4 mr-2 text-muted-foreground" />
                                    Edit {title}
                                </DropdownMenuItem>)}
                                {onDelete && (<DropdownMenuItem onClick={() => {
                                    onDelete(data)
                                    onClose()
                                }}><Trash className="w-4 h-4 mr-2 text-muted-foreground" />
                                    Delete {title}
                                </DropdownMenuItem>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>)}
                </AlertDialogHeader>
                <div className="space-y-2 sm:space-y-4">
                    {data ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {columns.map((column, index) => (
                                <div key={index} className="flex flex-col bg-primary/10 hover:bg-primary/15 hover:scale-105 transition-all ease-linear duration-150 p-4 rounded-xl">
                                    <span className="font-semibold text-sm text-muted-foreground">
                                        {column.header as ReactNode}:
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
                <AlertDialogFooter>
                    <AlertDialogCancel
                        className="px-4 py-2 text-sm font-medium text-secondary bg-secondary-foreground/80 rounded-lg hover:bg-secondary-foreground hover:text-white dark:hover:text-black focus:ring focus:ring-secondary/70 transition-all"
                    >
                        Cancel
                    </AlertDialogCancel>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
