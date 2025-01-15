// src/components/dashboard/DashboardCard.tsx
"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Sparkline from "@/components/chart/Sparkline";
import CircularProgress from "@/components/chart/CircularProgress";
import DonutChart from "@/components/chart/DonutChart";

import { DollarSign, CreditCard, Activity, Users, Package, Truck, LucideIcon } from 'lucide-react';
import { CardData, OtherChartData } from "@/lib/slices/kpi/kpiSlice";


interface DashboardCardProps {
    card: CardData | OtherChartData;
}

const DashboardCard = ({ card }: DashboardCardProps) => {
    let IconComponent: LucideIcon | null = null;

    switch (card.icon) {
        case "DollarSign":
            IconComponent = DollarSign;
            break;
        case "CreditCard":
            IconComponent = CreditCard;
            break;
        case "Activity":
            IconComponent = Activity;
            break;
        case "Users":
            IconComponent = Users;
            break;
        case "Package":
            IconComponent = Package;
            break;
        case "Truck":
            IconComponent = Truck;
            break;
    }

    return (
        <Card className="bg-slate-100 dark:bg-gray-900 transition-all hover:shadow-lg overflow-hidden flex flex-col justify-between">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                {IconComponent && <IconComponent className="h-4 w-4 text-muted-foreground" />}
            </CardHeader>
            <CardContent className="flex-1 justify-between items-start flex flex-col">
                {card.type === "revenue" && (
                    <div className="text-2xl flex-col font-bold flex justify-between items-start">
                        <span>{card.value}</span>
                        {(card as CardData).sparklineData && <Sparkline data={(card as CardData).sparklineData!} type={(card as CardData).type} />}
                    </div>
                )}
                {card.type === "number" && (
                    <div className="text-2xl flex-col font-bold flex justify-between items-start">
                        <span>{card.value}</span>
                        {(card as CardData).sparklineData && <Sparkline data={(card as CardData).sparklineData!} type={(card as CardData).type} />}
                    </div>
                )}
                {card.type === "orders" && (
                    <div className="text-2xl flex-col font-bold flex justify-between items-start">
                        <span>{card.value}</span>
                        {(card as CardData).sparklineData && <Sparkline data={(card as CardData).sparklineData!} type={(card as CardData).type} />}
                    </div>
                )}
                {card.type === "progress" && (
                    <div className='flex justify-center items-center w-full h-full'>
                        <CircularProgress value={(card as OtherChartData).progress!} label={(card as OtherChartData).label!} />
                    </div>
                )}
                {card.type === "donut" && (
                    <div className='flex justify-center items-center w-full h-full'>
                        <DonutChart data={(card as OtherChartData).donutData!} labels={(card as OtherChartData).donutLabels!} colors={(card as OtherChartData).colors!} />
                    </div>
                )}
                <p className="text-xs text-muted-foreground">{card.description}</p>
            </CardContent>
        </Card>
    );
};

export default DashboardCard;