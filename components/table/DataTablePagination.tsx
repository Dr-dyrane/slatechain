// src/components/table/DataTablePagination.tsx
"use client";

import { Button } from "@/components/ui/button";
import { useReactTable } from "@tanstack/react-table";
import * as React from "react"

interface DataTablePaginationProps<TData> {
   table: ReturnType<typeof useReactTable<TData>>;
}

export function DataTablePagination<TData>({ table }: DataTablePaginationProps<TData>) {
    return (
        <div className="flex items-center justify-between space-x-2 py-4">
          <div className="flex-1 text-sm text-muted-foreground">
               {table.getFilteredSelectedRowModel().rows.length} of{" "}
            {table.getFilteredRowModel().rows.length} row(s) selected.
          </div>
           <div className="space-x-2">
             <Button
                 variant="outline"
                 size="sm"
               onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                Previous
             </Button>
            <Button
                variant="outline"
               size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
            >
                Next
             </Button>
          </div>
      </div>
    );
}