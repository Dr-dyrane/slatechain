// src/app/dashboard/page.tsx
"use client"

import { useEffect } from "react"
import { CardTitle } from "@/components/ui/card"
import { columns } from "../inventory/page"
import { DataTable } from "@/components/table/DataTable"
import { useDispatch, useSelector } from "react-redux"
import { RootState } from "@/lib/store"
import { useRouter } from "next/navigation"
import { resumeOnboarding } from "@/lib/slices/onboardingSlice"
import UserStatusAlert from "@/components/dashboard/UserStatusAlert"
import { fetchKPIs } from "@/lib/slices/kpi/kpiSlice"
import  DashboardCard from "@/components/dashboard/DashboardCard";
import { CardData, OtherChartData } from "@/lib/slices/kpi/kpiSlice";
import DashboardSkeleton from "./loading";


export default function Dashboard() {
  const inventory = useSelector((state: RootState) => state.inventory.items)
   const { cardData, otherChartData, loading, error}  = useSelector((state: RootState) => state.kpi);
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

    if(loading) {
        return <DashboardSkeleton />
     }
    if(error) {
        return <div> {error}</div>
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
        {cardData?.map((card, index) => (
                <DashboardCard key={index} card={card as CardData} />
        ))}
      </div>


      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
           {otherChartData?.map((card, index) => (
              <DashboardCard key={index} card={card as OtherChartData} />
          ))}
      </div>

      <CardTitle>Recent Inventory</CardTitle>

      <DataTable columns={columns} data={inventory} />
    </div>
  )
}