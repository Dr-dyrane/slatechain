// src/app/dashboard/page.tsx
"use client"

import { useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, CreditCard, Activity, Users, Package, Truck, LucideIcon } from 'lucide-react'
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
import { fetchKPIs } from "@/lib/slices/kpi/kpiSlice"


const iconMap: Record<string, LucideIcon> = {
  "DollarSign": DollarSign,
  "CreditCard": CreditCard,
  "Activity": Activity,
  "Users": Users,
  "Package": Package,
  "Truck": Truck,
};

export const mapIcon = (iconName: string | null): any | null => {
  if (iconName && iconMap[iconName]) {
      return iconMap[iconName];
  }
  return null;
};


export default function Dashboard() {
  const inventory = useSelector((state: RootState) => state.inventory.items)
  const { cardData, otherChartData, loading, error } = useSelector((state: RootState) => state.kpi)
  const dispatch = useDispatch()
  const router = useRouter()
  const user = useSelector((state: RootState) => state.auth.user);

  useEffect(() => {
    dispatch(fetchKPIs() as any);
  }, [dispatch]);

  const handleResumeOnboarding = () => {
    dispatch(resumeOnboarding())
    router.push('/onboarding')
  }

  const handleReviewKYC = () => {
    router.push('/kyc')
  }
  if (loading) {
    return <div> Loading Kpis please wait...</div>
  }
  if (error) {
    return <div> {error}</div>
  }

  const formattedCardData = cardData?.map(card => ({
    ...card,
    icon: mapIcon(card.icon),

  })) || [];

  const formattedOtherChartData = otherChartData?.map(chart => ({
    ...chart,
    icon: mapIcon(chart.icon)
  })) || [];


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
        {formattedCardData?.map((card, index) => (
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
        {formattedOtherChartData?.map((card, index) => (
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