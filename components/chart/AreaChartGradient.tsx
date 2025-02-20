"use client"

import { format } from "date-fns"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts"

interface AreaChartGradientProps {
    data: any
}

export function AreaChartGradient({ data }: AreaChartGradientProps) {
    if (!data || !data.data || data.data.length === 0) {
        return (
            <div className="flex h-[400px] items-center justify-center">
                <p className="text-muted-foreground">No data available</p>
            </div>
        )
    }

    // Custom colors for the chart
    const colors = {
        quantity: "#2563eb", // blue-600
        upper: "#16a34a", // green-600
        lower: "#dc2626", // red-600
    }

    // Format numbers with commas and handle nulls
    const formatValue = (value: number | null) => {
        if (value === null || value === undefined) return "N/A"
        return new Intl.NumberFormat().format(value)
    }

    return (
        <div className="w-full h-[500px] border rounded-lg p-6 bg-white">
            <h3 className="text-lg font-semibold mb-4">{data.title}</h3>
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                    width={500}
                    height={400}
                    data={data.data}
                    margin={{
                        top: 10,
                        right: 30,
                        left: 0,
                        bottom: 0,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey={data.xAxisKey} tickFormatter={(value) => format(new Date(value), "MMM yyyy")} />
                    <YAxis tickFormatter={formatValue} />
                    <Tooltip
                        formatter={(value: number) => [formatValue(value), "Value"]}
                        labelFormatter={(label) => format(new Date(label), "MMM dd, yyyy")}
                    />
                    <defs>
                        <linearGradient id="colorQuantity" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={colors.quantity} stopOpacity={0.8} />
                            <stop offset="95%" stopColor={colors.quantity} stopOpacity={0.1} />
                        </linearGradient>
                        <linearGradient id="colorUpper" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={colors.upper} stopOpacity={0.8} />
                            <stop offset="95%" stopColor={colors.upper} stopOpacity={0.1} />
                        </linearGradient>
                        <linearGradient id="colorLower" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={colors.lower} stopOpacity={0.8} />
                            <stop offset="95%" stopColor={colors.lower} stopOpacity={0.1} />
                        </linearGradient>
                    </defs>
                    <Area type="monotone" dataKey={data.lowerKey} stroke={colors.lower} fill="url(#colorLower)" strokeWidth={2} />
                    <Area
                        type="monotone"
                        dataKey={data.yAxisKey}
                        stroke={colors.quantity}
                        fill="url(#colorQuantity)"
                        strokeWidth={2}
                    />
                    <Area type="monotone" dataKey={data.upperKey} stroke={colors.upper} fill="url(#colorUpper)" strokeWidth={2} />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    )
}

