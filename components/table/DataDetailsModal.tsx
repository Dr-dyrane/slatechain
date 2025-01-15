// src/components/table/DataDetailsModal.tsx
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
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { flexRender } from "@tanstack/react-table"
import {  ColumnDef } from "@tanstack/react-table"

interface DataDetailsModalProps<TData> {
    open: boolean;
    onClose: () => void;
    data: TData | null;
     title: string;
    columns: ColumnDef<TData, any>[]
}

export function DataDetailsModal<TData extends Record<string, any>>({ open, onClose, data, columns, title }: DataDetailsModalProps<TData>) {
  const renderValue = (column: ColumnDef<TData, any>, item: TData) => {
          if (column.cell && typeof column.cell === 'function') {
              return column.cell({ row: { original: item, getValue: (key: string) => item[key] } })
          }
          return column.accessorKey ? item[column.accessorKey as string] : '';
       };

    return (
       <AlertDialog open={open} onOpenChange={onClose}>
            <AlertDialogContent>
                <AlertDialogHeader className="">
                    <AlertDialogTitle>{title || "Row Details"}</AlertDialogTitle>
                    <AlertDialogDescription>View the details of the selected row</AlertDialogDescription>
                </AlertDialogHeader>
                <div className="space-y-4 p-4">
                    {data &&  columns.map((column, index) => (
                        <div key={index} className="flex flex-col">
                            <span className="font-semibold text-sm">{column.header}:</span>
                            <span className='font-medium'>{renderValue(column, data)}</span>
                        </div>
                    ))}
             </div>
            <AlertDialogFooter>
                 <AlertDialogCancel>Cancel</AlertDialogCancel>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
    );
}