"use client"
import { Search, ChevronDown } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ExportButton } from "./ExportButton"
import type { useReactTable } from "@tanstack/react-table"

interface DataTableToolbarProps<TData> {
  table: ReturnType<typeof useReactTable<TData>>
  data: TData[]
  columns: { accessorKey: string; header: string }[]
  searchKey?: string
  exportFilename?: string
}

export function DataTableToolbar<TData extends Record<string, any>>({
  table,
  data,
  columns,
  searchKey = "name",
  exportFilename = "export.csv",
}: DataTableToolbarProps<TData>) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-4">
      <div className="flex items-center space-x-2 w-full sm:w-auto">
        <Search className="h-5 w-5 text-muted-foreground" />
        <Input
          placeholder="Filter..."
          value={(table.getColumn(searchKey)?.getFilterValue() as string) ?? ""}
          onChange={(event) => table.getColumn(searchKey)?.setFilterValue(event.target.value)}
          className="max-w-sm"
          aria-label="Filter table"
        />
      </div>

      <div className="flex items-center space-x-2 w-full sm:w-auto justify-between sm:justify-end">
        <ExportButton data={data} columns={columns} filename={exportFilename} />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columns <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) => column.toggleVisibility(!!value)}
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                )
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}

