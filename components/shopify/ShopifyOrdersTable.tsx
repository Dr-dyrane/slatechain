"use client"

import { useCallback, useMemo } from "react"
import { DataTable } from "@/components/table/DataTable"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import type { ColumnDef } from "@tanstack/react-table"
import type { ShopifyOrder } from "@/lib/types"

export function ShopifyOrdersTable({ orders }: { orders: ShopifyOrder[] }) {
  const columns = useMemo<ColumnDef<ShopifyOrder, any>[]>(
    () => [
      {
        accessorKey: "order_number",
        header: "Order",
        cell: ({ row }) => <div className="font-medium">#{row.getValue("order_number")}</div>,
      },
      {
        accessorKey: "created_at",
        header: "Date",
        cell: ({ row }) => format(new Date(row.getValue("created_at")), "MMM d, yyyy"),
      },
      {
        accessorKey: "name",
        header: "Customer",
        cell: ({ row }) => {
          const customer = row.original.customer
          return (
            <div className="flex flex-col">
              <span className="font-medium">{`${customer.first_name} ${customer.last_name}`}</span>
              <span className="text-xs text-muted-foreground">{customer.email}</span>
            </div>
          )
        },
      },
      {
        accessorKey: "fulfillment_status",
        header: "Status",
        cell: ({ row }) => {
          const status = row.getValue("fulfillment_status") as string
          return <Badge variant={status === "fulfilled" ? "default" : "secondary"}>{status || "Unfulfilled"}</Badge>
        },
      },
      {
        accessorKey: "total_price",
        header: "Amount",
        cell: ({ row }) => <div className="">${row.getValue("total_price")}</div>,
      },
    ],
    [],
  )

  const formatOrderForDetails = useCallback(
    (order: ShopifyOrder) => ({
      ...order,
      name: `Order #${order.order_number}`,
    }),
    [],
  )

  return <DataTable columns={columns} data={orders.map(formatOrderForDetails)} />
}

