"use client"

import { useEffect, useState, useMemo } from "react"
import { CardTitle } from "@/components/ui/card"
import { columns } from "../inventory/page"
import { DataTable } from "@/components/table/DataTable"
import { useDispatch, useSelector } from "react-redux"
import { RootState } from "@/lib/store"
import { useRouter } from "next/navigation"
import { resumeOnboarding } from "@/lib/slices/onboardingSlice"
import UserStatusAlert from "@/components/dashboard/UserStatusAlert"
import { fetchKPIs, fetchDemandPlanningData, CardData, OtherChartData, fetchAreaChartData } from "@/lib/slices/kpi/kpiSlice"
import DashboardCard from "@/components/dashboard/DashboardCard";
import DashboardSkeleton from "./loading";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DemandForecast } from "@/lib/types";
import { AreaChartGradient } from "@/components/chart/AreaChartGradient"
import ShopifyComponent from "./ShopifyComponent"; //Import

const demandColumns = [
  { accessorKey: "name", header: "Name" },
  { accessorKey: "inventoryItemId", header: "Product ID" },
  { accessorKey: "forecastDate", header: "Forecast Date" },
  { accessorKey: "quantity", header: "Quantity" },
  { accessorKey: "confidenceIntervalUpper", header: "Upper" },
  { accessorKey: "confidenceIntervalLower", header: "Lower" },
  { accessorKey: "algorithmUsed", header: "Algorithm" },
];


export default function Dashboard() {
  //Local State
  const [activeTab, setActiveTab] = useState("overview");

  //Global Store
  const inventory = useSelector((state: RootState) => state.inventory);
  const { cardData, otherChartData, loading, error, demandPlanningKPIs, demandForecasts, areaChartData } = useSelector((state: RootState) => state.kpi);

  //Dispatch
  const dispatch = useDispatch()

  //Redirections
  const router = useRouter()
  const user = useSelector((state: RootState) => state.auth.user);

  useEffect(() => {
    dispatch(fetchKPIs() as any);
    dispatch(fetchDemandPlanningData() as any);
    dispatch(fetchAreaChartData() as any)

  }, [dispatch]);

  const handleResumeOnboarding = () => {
    dispatch(resumeOnboarding())
    router.push('/onboarding')
  }

  const handleReviewKYC = () => {
    router.push('/kyc')
  }

  //Data
  const formattedInventory = useMemo(() => {
    return inventory.items?.map(item => ({
      ...item,
      id: item.id.toString(),
    })) || [];
  }, [inventory.items]);

  const formattedDemandForecasts = useMemo(() => {
    return demandForecasts?.map((item) => ({
      ...item,
      forecastDate: new Date(item.forecastDate).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
    })) || [];
  }, [demandForecasts]);


  //KPI Cards
  const kpiCards = useMemo(() => {
    switch (activeTab) {
      case "overview":
        return cardData;
      case "demand":
        return [
          { title: "Forecast Accuracy", icon: "TrendingUp", value: demandPlanningKPIs?.forecastAccuracy.toString() || "N/A", description: "Overall forecast accuracy", type: "number", sparklineData: null },
          { title: "Mean Absolute Deviation", icon: "Activity", value: demandPlanningKPIs?.meanAbsoluteDeviation.toString() || "N/A", description: "Average forecast deviation", type: "number", sparklineData: null },
          { title: "Bias", icon: "ArrowRight", value: demandPlanningKPIs?.bias.toString() || "N/A", description: "Directional forecast bias", type: "number", sparklineData: null },
          { title: "Service Level", icon: "CheckCircle", value: demandPlanningKPIs?.serviceLevel.toString() || "N/A", description: "Probability of meeting demand", type: "number", sparklineData: null }
        ] as CardData[];
      case "shopify":
        return
      default:
        return cardData;
    }
  }, [activeTab, cardData, demandPlanningKPIs]);

  //Loading and Error
  if (loading) {
    return <DashboardSkeleton />
  }
  if (error) {
    return <div> {error}</div>
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl sm:text-3xl font-bold">Dashboard</h1>

      {user && <UserStatusAlert
        kycStatus={user.kycStatus}
        onboardingStatus={user.onboardingStatus}
        onResumeOnboarding={handleResumeOnboarding}
        onReviewKYC={handleReviewKYC}
      />}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpiCards?.map((card, index) => (
          <DashboardCard key={index} card={card} />
        ))}
      </div>

      {/* Charting and display  logic */}
      {activeTab === "overview" && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {otherChartData?.map((card, index) => (
            <DashboardCard key={index} card={card as OtherChartData} />
          ))}
        </div>
      )}

      {activeTab === "demand" && areaChartData && (
        <AreaChartGradient data={areaChartData} />
      )}

      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full mb-8 flex flex-wrap justify-start">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="demand">Demand Planning</TabsTrigger>
          {user?.integrations?.shopify?.enabled && (
            <TabsTrigger value="shopify">Shopify</TabsTrigger>
          )}
        </TabsList>
        <TabsContent value="overview">
          <div className="flex justify-between items-center mb-4">
            <p className="text-muted-foreground">Recent Inventory</p>
          </div>
          <DataTable columns={columns} data={formattedInventory as any} />
        </TabsContent>
        <TabsContent value="demand">
          <div className="flex justify-between items-center mb-4">
            <p className="text-muted-foreground">Demand Forecasts</p>
          </div>
          <DataTable columns={demandColumns} data={formattedDemandForecasts as any} />
        </TabsContent>
        {user?.integrations?.shopify?.enabled && (
          <TabsContent value="shopify"> {/* Add this to link */}
            <ShopifyComponent />
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}