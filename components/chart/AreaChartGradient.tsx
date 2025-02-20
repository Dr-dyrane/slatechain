"use client";

import { format } from "date-fns";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import type { AreaChartData } from "@/lib/types";
import useMediaQuery from "@/hooks/use-media-query";
import { useEffect, useRef, useState } from "react";

interface AreaChartGradientProps {
    data: AreaChartData | null;
}

export function AreaChartGradient({ data }: AreaChartGradientProps) {
    const containerRef = useRef<HTMLDivElement>(null)
    const [containerWidth, setContainerWidth] = useState(0)

    const isSmallScreen = useMediaQuery("(max-width: 640px)"); //Example breakpoint
    if (!data || !data.data || data.data.length === 0) {
        return (
            <div className="flex h-[400px] items-center justify-center">
                <p className="text-muted-foreground">No data available</p>
            </div>
        );
    }

    useEffect(() => {
        if (!containerRef.current) return

        const resizeObserver = new ResizeObserver((entries) => {
            for (const entry of entries) {
                const width = entry.contentRect.width
                setContainerWidth(Math.max(width * 0.9, 300))
            }
        })

        resizeObserver.observe(containerRef.current)

        return () => {
            resizeObserver.disconnect()
        }
    }, [])


    // Define date format based on screen size
    const dateFormat = isSmallScreen ? "MMM" : "MMM yyyy";

    // Custom colors for the chart with better visibility
    const colors = {
        quantity: "#3b82f6", // blue-500
        upper: "#22c55e", // green-500
        lower: "#ef4444", // red-500
    }

    // Format numbers with commas and handle nulls
    const formatValue = (value: number | null) => {
        if (value === null || value === undefined) return "N/A";
        return new Intl.NumberFormat().format(value);
    };

    const dateFormatter = (value: string) => {
        try {
            return format(new Date(value), dateFormat);
        } catch (error) {
            console.error("Error formatting date:", value, error);
            return value; // Return original value if formatting fails
        }
    };

    // Custom tooltip formatter
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-muted p-4 border rounded-xl shadow-lg">
                    <p className="text-sm font-medium mb-2">{format(new Date(label), "MMMM d, yyyy")}</p>
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
    }

    const getChartDimensions = () => {
        const minWidth = 300
        const maxWidth = 1200
        const padding = 0

        if (!containerWidth) return minWidth

        return Math.min(Math.max(containerWidth - padding, minWidth), maxWidth)
    }

    return (
        <div className="w-full h-[400px] border rounded-lg p-0 relative" ref={containerRef}>
            <div className="p-4"> {/* Container for title and subtitle */}
                <h3 className="text-lg sm:text-xl font-semibold">{data.title}</h3>
                <p className="text-sm text-muted-foreground">Monthly trend analysis</p>
            </div>
            <div className="h-[300px] overflow-x-auto">
                <ResponsiveContainer width="100%" height="100%" >
                    <AreaChart
                        width={getChartDimensions()}
                        height={300}
                        data={data.data}
                        margin={{
                            top: 10,
                            right: 30,
                            left: 0,
                            bottom: 0,
                        }}
                    >
                        <CartesianGrid strokeDasharray="3 3" vertical={true} stroke="#e5e7eb" strokeWidth={0.125} />
                        <XAxis dataKey={data.xAxisKey} tickFormatter={dateFormatter} tick={{ fill: "#6b7280" }}
                            tickLine={false}
                            axisLine={{ stroke: "#e5e7eb" }} />
                        <YAxis tickFormatter={formatValue} tick={{ fill: "#6b7280" }}
                            tickLine={false}
                            axisLine={{ stroke: "#e5e7eb" }} />
                        <Tooltip
                            formatter={(value: number) => [formatValue(value), "Value"]}
                            labelFormatter={(label) => format(new Date(label), "MMM dd, yyyy")}
                        />
                        <Tooltip content={CustomTooltip} />
                        <defs>
                            <linearGradient id="colorQuantity" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={colors.quantity} stopOpacity={0.3} />
                                <stop offset="95%" stopColor={colors.quantity} stopOpacity={0.05} />
                            </linearGradient>
                            <linearGradient id="colorUpper" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={colors.upper} stopOpacity={0.3} />
                                <stop offset="95%" stopColor={colors.upper} stopOpacity={0.05} />
                            </linearGradient>
                            <linearGradient id="colorLower" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={colors.lower} stopOpacity={0.3} />
                                <stop offset="95%" stopColor={colors.lower} stopOpacity={0.05} />
                            </linearGradient>
                        </defs>
                        <Area
                            type="monotone"
                            dataKey={data.lowerKey}
                            name="Lower Confidence"
                            stroke={colors.lower}
                            fill="url(#colorLower)"
                            strokeWidth={2}
                            dot={false}
                        />
                        <Area
                            type="monotone"
                            dataKey={data.yAxisKey}
                            name="Quantity"
                            stroke={colors.quantity}
                            fill="url(#colorQuantity)"
                            strokeWidth={2}
                            dot={false}
                        />
                        <Area
                            type="monotone"
                            dataKey={data.upperKey}
                            name="Upper Confidence"
                            stroke={colors.upper}
                            fill="url(#colorUpper)"
                            strokeWidth={2}
                            dot={false}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

export default AreaChartGradient;