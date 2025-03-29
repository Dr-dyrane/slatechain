"use client"
import { Button } from "@/components/ui/button"
import { Download, ChevronDown } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { exportToCSV } from "@/lib/utils"

interface ExportButtonProps<TData extends Record<string, any>> {
  data: TData[]
  columns: { accessorKey: string; header: string }[]
  filename?: string
  label?: string
}

export function ExportButton<TData extends Record<string, any>>({
  data,
  columns,
  filename = "export.csv",
  label = "Export",
}: ExportButtonProps<TData>) {
  const handleExportAll = () => {
    exportToCSV(data, columns, filename)
  }

  const handleExportSelected = (selectedData: TData[]) => {
    exportToCSV(selectedData, columns, filename)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="ml-auto">
          <Download className="mr-2 h-4 w-4" />
          {label}
          <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleExportAll}>Export all records</DropdownMenuItem>
        {/* We'll implement selected export in the DataTable component */}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

