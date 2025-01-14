// src/app/dashboard/page.tsx
"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, CreditCard, Activity, Users, Package, Truck } from 'lucide-react'
import { columns } from "../inventory/page"
import { DataTable } from "@/components/DataTable"
import { useDispatch, useSelector } from "react-redux"
import { RootState } from "@/lib/store"
import { useRouter } from "next/navigation"
import { resumeOnboarding } from "@/lib/slices/onboardingSlice"
import UserStatusAlert from "@/components/dashboard/UserStatusAlert"
import Sparkline from "@/components/chart/Sparkline"
import CircularProgress from "@/components/chart/CircularProgress"
import DonutChart from "@/components/chart/DonutChart"

const cardData = [
  {
    title: "Total Revenue",
    icon: DollarSign,
    value: "$45,231.89",
    description: "+20.1% from last month",
    type: "revenue",
    sparklineData: [10, 15, 12, 18, 20, 25, 22, 28, 30, 35, 32, 40]
  },
  {
    title: "Inventory Items",
    icon: CreditCard,
    value: "+2,350",
    description: "+180.1% from last month",
    type: "number",
    sparklineData: null
  },
  {
    title: "Active Orders",
    icon: Activity,
    value: "+573",
    description: "+201 since last hour",
    type: "orders",
    sparklineData: [50, 60, 55, 65, 70, 75, 80, 78, 85, 90, 92, 95]
  },
  {
    title: "Shipments in Transit",
    icon: Users,
    value: "+989",
    description: "+18 since last hour",
    type: "number",
    sparklineData: null
  },
]

const otherChartData = [
  {
    title: "Order Fulfillment",
    icon: Package,
    type: "progress",
    progress: 75,
    label: "75% Complete"
  },
  {
    title: "Inventory by Category",
    icon: CreditCard,
    type: "donut",
    donutData: [30, 40, 20, 10],
    donutLabels: ["Electronics", "Clothing", "Books", "Other"]
  }
  ,
  {
    title: "Shipment Status",
    icon: Truck,
    type: "donut",
    donutData: [45, 30, 25],
    donutLabels: ["In Transit", "Pending", "Delivered"],
    colors: ["#38bdf8", "#f97316", "#4ade80"]
  }

]


export default function Dashboard() {
  const inventory = useSelector((state: RootState) => state.inventory.items)
  const dispatch = useDispatch()
  const router = useRouter()
  const user = useSelector((state: RootState) => state.auth.user);

  const handleResumeOnboarding = () => {
    dispatch(resumeOnboarding())
    router.push('/onboarding')
  }

  const handleReviewKYC = () => {
    router.push('/kyc')
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      {user && <UserStatusAlert
        kycStatus={user.kycStatus}
        onboardingStatus={user.onboardingStatus}
        onResumeOnboarding={handleResumeOnboarding}
        onReviewKYC={handleReviewKYC}
      />}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {cardData.map((card, index) => (
          <Card key={index} className="bg-slate-100 dark:bg-gray-900 transition-all hover:shadow-lg overflow-hidden flex flex-col justify-between">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <card.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="flex-1 justify-between items-start flex flex-col">
              <div className="text-2xl flex-col font-bold flex justify-between items-start">
                <span>{card.value}</span>
                {card.sparklineData && <Sparkline data={card.sparklineData} type={card.type} />}
              </div>

              <p className="text-xs text-muted-foreground">{card.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>


      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {otherChartData.map((card, index) => (
          <Card key={index} className="bg-slate-100 dark:bg-gray-900 transition-all hover:shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <card.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className='flex justify-center items-center'>
              {card.type === "progress" ? <CircularProgress value={card.progress} label={card.label} /> : null}
              {card.type === "donut" ? <DonutChart data={card.donutData} labels={card.donutLabels} colors={card.colors} /> : null}
            </CardContent>
          </Card>
        ))}
      </div>

      <CardTitle>Recent Inventory</CardTitle>

      <DataTable columns={columns} data={inventory} />

    </div>
  )
}