import { DataTable } from "@/components/table/DataTable"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PlusIcon } from "lucide-react"
import type { Supplier } from "@/lib/types"

const supplierColumns = [
  { accessorKey: "name", header: "Name" },
  { accessorKey: "contactPerson", header: "Contact Person" },
  { accessorKey: "email", header: "Email" },
  { accessorKey: "phoneNumber", header: "Phone Number" },
  { accessorKey: "rating", header: "Rating" },
  { accessorKey: "status", header: "Status" },
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
            <PlusIcon className="mr-2 h-4 w-4" /> Add Supplier
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

