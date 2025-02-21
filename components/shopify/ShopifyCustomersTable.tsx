"use client"

import { useMemo } from "react"
import { DataTable } from "@/components/table/DataTable"
import type { ColumnDef } from "@tanstack/react-table"
import type { ShopifyCustomer } from "@/lib/types"

export function ShopifyCustomersTable({ customers }: { customers: ShopifyCustomer[] }) {
  const columns = useMemo<ColumnDef<ShopifyCustomer, any>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Customer",
        cell: ({ row }) => {
          const customer = row.original
          return (
            <div className="flex flex-col">
              <span className="font-medium">{`${customer.first_name} ${customer.last_name}`}</span>
              <span className="text-xs text-muted-foreground">{customer.email}</span>
            </div>
          )
        },
      },
      {
        accessorKey: "orders_count",
        header: "Orders",
        cell: ({ row }) => row.getValue("orders_count"),
      },
      {
        accessorKey: "total_spent",
        header: "Total Spent",
        cell: ({ row }) => <div className="">${row.getValue("total_spent")}</div>,
      },
      {
        accessorKey: "default_address",
        header: "Location",
        cell: ({ row }) => {
          const address = row.original.default_address
          return address ? (
            <div className="text-sm">
              {address.city}, {address.province}
            </div>
          ) : (
            <span className="text-muted-foreground">No address</span>
          )
        },
      },
    ],
    [],
  )

  const formatCustomerForDetails = (customer: ShopifyCustomer) => ({
    ...customer,
    name: `${customer.first_name} ${customer.last_name}`,
    id: customer.id.toString(),
  })

  return <DataTable columns={columns} data={customers.map(formatCustomerForDetails)} />
}

