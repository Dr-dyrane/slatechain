"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, CreditCard, Activity, Users } from 'lucide-react'
import { columns } from "../inventory/page"
import { DataTable } from "@/components/DataTable"
import { useDispatch, useSelector } from "react-redux"
import { RootState } from "@/lib/store"
import { useEffect } from "react"
import { setInventory } from "@/lib/slices/inventorySlice"
import { useRouter } from "next/navigation"
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { resumeOnboarding } from "@/lib/slices/onboardingSlice"
import { Button } from "@/components/ui/button"
import UserStatusAlert from "@/components/dashboard/UserStatusAlert"

const cardData = [
  {
    title: "Total Revenue",
    icon: DollarSign,
    value: "$45,231.89",
    description: "+20.1% from last month"
  },
  {
    title: "Inventory Items",
    icon: CreditCard,
    value: "+2,350",
    description: "+180.1% from last month"
  },
  {
    title: "Active Orders",
    icon: Activity,
    value: "+573",
    description: "+201 since last hour"
  },
  {
    title: "Shipments in Transit",
    icon: Users,
    value: "+989",
    description: "+18 since last hour"
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

  useEffect(() => {
    // Simulated API call
    const fetchInventory = async () => {
      // In a real application, this would be an API call
      const data = [
        { id: 1, name: "Product A", sku: "SKU001", quantity: 100, location: "Warehouse 1" },
        { id: 2, name: "Product B", sku: "SKU002", quantity: 150, location: "Warehouse 2" },
        { id: 3, name: "Product C", sku: "SKU003", quantity: 75, location: "Warehouse 1" },
      ]
      dispatch(setInventory(data))
    }

    fetchInventory()
  }, [dispatch])

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
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <card.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <p className="text-xs text-muted-foreground">{card.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <CardTitle>Recent Inventory</CardTitle>

      <DataTable columns={columns} data={inventory} />

    </div>
  )
}

