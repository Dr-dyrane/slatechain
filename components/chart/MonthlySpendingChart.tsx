"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartTooltipItem } from "@/components/ui/chart"
import { formatCurrency } from "@/lib/utils"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from "recharts"

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
                    <ChartContainer>
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
                                    tickFormatter={(value) => formatCurrency(value, false)}
                                    domain={[0, maxValue]}
                                />
                                <Tooltip
                                    content={({ active, payload }) => {
                                        if (active && payload && payload.length) {
                                            return (
                                                <ChartTooltip>
                                                    <ChartTooltipContent>
                                                        <ChartTooltipItem
                                                            label={payload[0].payload.name}
                                                            value={formatCurrency(payload[0].value as number)}
                                                            color={barColor}
                                                        />
                                                    </ChartTooltipContent>
                                                </ChartTooltip>
                                            )
                                        }
                                        return null
                                    }}
                                />
                                <Bar dataKey="value" fill={barColor} radius={[4, 4, 0, 0]} barSize={30} />
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartContainer>
                )}
            </CardContent>
        </Card>
    )
}

