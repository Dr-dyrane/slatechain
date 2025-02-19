import type { Supplier } from "@/lib/types"
import DashboardCard from "../dashboard/DashboardCard"


export interface CardData {
    title: string
    value: string
    icon: string | null
    type: "revenue" | "number" | "orders" 
    description: string
    sparklineData: number[] | null
  }

  export interface OtherChartData extends CardData {
    progress?: number
    label?: string
    donutData?: number[]
    donutLabels?: string[]
    colors?: string[]
  }

interface SupplierKPIsProps {
  suppliers: Supplier[]
}

export function SupplierKPIs({ suppliers }: SupplierKPIsProps) {
  const totalSuppliers = suppliers.length
  const activeSuppliers = suppliers.filter((s) => s.status === "ACTIVE").length
  const averageRating = suppliers.reduce((sum, s) => sum + s.rating, 0) / totalSuppliers || 0

  const kpiCards: CardData[] |  OtherChartData []= [
    {
      title: "Total Suppliers",
      value: totalSuppliers.toString(),
      icon: "Users",
      type: "number",
      description: "Total number of suppliers",
      sparklineData: [totalSuppliers]
    },
    {
      title: "Active Suppliers",
      value: activeSuppliers.toString(),
      icon: "UserCheck",
      type: "number",
      description: "Number of active suppliers",
      sparklineData: [activeSuppliers]
    },
    {
      title: "Average Rating",
      value: averageRating.toFixed(2),
      icon: "Star",
      type: "number",
      description: "Average supplier rating",
      sparklineData: [averageRating]
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {kpiCards.map((card, index) => (
        <DashboardCard key={index} card={card} />
      ))}
    </div>
  )
}

