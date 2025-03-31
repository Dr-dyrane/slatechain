import { DataTable } from "@/components/table/DataTable"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CirclePlus, Star, StarHalf } from "lucide-react"
import type { Supplier } from "@/lib/types"
import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "../ui/badge"

const supplierColumns: ColumnDef<Supplier>[] = [
  { accessorKey: "name", header: "Name" },
  { accessorKey: "contactPerson", header: "Contact Person" },
  { accessorKey: "email", header: "Email", },
  {
    accessorKey: "phoneNumber", header: "Phone Number", cell: ({ row }) => (
      <div className="truncate" title={row.original.phoneNumber}>
        {row.original.phoneNumber}
      </div>
    ),
  },
  {
    accessorKey: "rating", header: "Rating",
    cell: ({ row }) => {
      const rating = row.getValue("rating") as number
      return (
        <div className="flex items-center">
          {rating > 0
            ? Array.from({ length: Math.floor(rating) }).map((_, i) => (
              <Star key={i} className="h-4 w-4 text-yellow-400 fill-yellow-400" />
            ))
            : null}
          {rating % 1 !== 0 && <StarHalf className="h-4 w-4 text-yellow-400 fill-yellow-400" />}
          <span className="ml-1">{rating.toFixed(1)}</span>
        </div>
      )
    },
  },
  {
    accessorKey: "status", header: "Status",

    cell: ({ row }) => (
      <Badge variant={row.original.status === "ACTIVE" ? "success" : "destructive"}>
        {row.original.status}
      </Badge>
    ),
  },
]

interface SupplierListProps {
  suppliers: Supplier[]
  onAddSupplier: () => void
  onEditSupplier: (supplier: Supplier) => void
  onDeleteSupplier: (supplier: Supplier) => void
  onSelectSupplier: (supplier: Supplier) => void
}

export function SupplierList({
  suppliers,
  onAddSupplier,
  onEditSupplier,
  onDeleteSupplier,
  onSelectSupplier,
}: SupplierListProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Suppliers</CardTitle>
          <Button onClick={onAddSupplier}>
            <CirclePlus />
            <span className="hidden sm:flex ml-2">Add Supplier</span>
          </Button>
        </div>
        <CardDescription>Manage your supplier relationships</CardDescription>
      </CardHeader>
      <CardContent>
        <DataTable
          columns={supplierColumns}
          data={suppliers}
          onEdit={onEditSupplier}
          onDelete={onDeleteSupplier}
        />
      </CardContent>
    </Card>
  )
}

