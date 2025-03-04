// In MonthlySpendingChart.tsx
"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from "recharts" // Removed ChartTooltip/Content import
import React from 'react';


interface MonthlySpendingData {
    month: string
    amount: number
}

interface MonthlySpendingChartProps {
    data: MonthlySpendingData[]
    title?: string
    description?: string
    loading?: boolean
}

// Custom formatter (if needed, adjust as necessary)
const formatValue = (value: number | string) => {
    if (typeof value === 'number') {
        return formatCurrency(value);  // Use your currency formatting
    }
    return value; // Return as is for other types
};

export function MonthlySpendingChart({
    data,
    title = "Monthly Spending",
    description = "Your spending patterns over time",
    loading = false,
}: MonthlySpendingChartProps) {
    // Format the data for the chart
    const chartData = data.map((item) => ({
        name: item.month,
        value: item.amount,
    }))

    // Calculate the maximum value for the Y-axis
    const maxValue = Math.max(...chartData.map((item) => item.value)) * 1.2

    // Custom colors
    const barColor = "hsl(var(--primary))"

    // Custom tooltip formatter
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-muted p-4 border rounded-xl shadow-lg">
                    <p className="text-sm font-medium mb-2">{label}</p>
                    {payload.map((entry: any, index: number) => (
                        <div key={`item-${index}`} className="flex items-center gap-2 text-sm">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
                            <span className="font-medium">{entry.name}:</span>
                            <span>{formatValue(entry.value)}</span>
                        </div>
                    ))}
                </div>
            )
        }
        return null
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
                {loading ? (
                    <div className="h-full w-full flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                            <XAxis
                                dataKey="name"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: "hsl(var(--foreground))", fontSize: 12 }}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: "hsl(var(--foreground))", fontSize: 12 }}
                                tickFormatter={(value) => formatCurrency(value)} // Remove boolean argument
                                domain={[0, maxValue]}
                            />
                            <Tooltip content={CustomTooltip} />
                            <Bar dataKey="value" fill={barColor} radius={[4, 4, 0, 0]} barSize={30} />
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </CardContent>
        </Card>
    )
}