import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Supplier } from "@/lib/types"

interface SupplierKPIsProps {
  suppliers: Supplier[]
}

export function SupplierKPIs({ suppliers }: SupplierKPIsProps) {
  const totalSuppliers = suppliers.length
  const activeSuppliers = suppliers.filter((s) => s.status === "ACTIVE").length
  const averageRating = suppliers.reduce((sum, s) => sum + s.rating, 0) / totalSuppliers || 0

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Suppliers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalSuppliers}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Suppliers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{activeSuppliers}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{averageRating.toFixed(2)}</div>
        </CardContent>
      </Card>
    </div>
  )
}

