import type { Supplier } from "@/lib/types"
import DashboardCard from "../dashboard/DashboardCard"
import { useSelector } from "react-redux"
import { RootState } from "@/lib/store"


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
  const contracts = useSelector((state: RootState) => state.contracts.contracts)
  const activeContracts = contracts.filter((contract) => contract.status === "active").length

  const kpiCards: CardData[] | OtherChartData[] = [
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
    {
      title: "Active Contracts",
      value: activeContracts.toString(),
      icon: "FileText",
      type: "number",
      description: "Active supplier contracts",
      sparklineData: [activeContracts]
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {kpiCards.map((card, index) => (
        <DashboardCard key={index} card={card} />
      ))}
    </div>
  )
}

