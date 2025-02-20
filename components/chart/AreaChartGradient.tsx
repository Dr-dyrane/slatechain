"use client";

import { format } from "date-fns";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import type { AreaChartData } from "@/lib/types";
import useMediaQuery from "@/hooks/use-media-query";

interface AreaChartGradientProps {
    data: AreaChartData | null;
}

export function AreaChartGradient({ data }: AreaChartGradientProps) {
    const isSmallScreen = useMediaQuery("(max-width: 640px)"); //Example breakpoint
    if (!data || !data.data || data.data.length === 0) {
        return (
            <div className="flex h-[400px] items-center justify-center">
                <p className="text-muted-foreground">No data available</p>
            </div>
        );
    }

    // Define date format based on screen size
    const dateFormat = isSmallScreen ? "MMM" : "MMM yyyy";

    // Custom colors for the chart
    const colors = {
        quantity: "#2563eb", // blue-600
        upper: "#16a34a", // green-600
        lower: "#dc2626", // red-600
    };

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

    return (
        <div className="w-full h-[500px] border rounded-lg p-6 bg-white relative">
            <h3 className="text-lg font-semibold mb-4 absolute top-6 left-6">
                {data.title}
            </h3>
            <div className="h-[400px] overflow-x-auto">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                        width={500}
                        height={400}
                        data={data.data}
                        margin={{
                            top: 50,
                            right: 30,
                            left: 0,
                            bottom: 0,
                        }}
                    >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey={data.xAxisKey} tickFormatter={dateFormatter} />
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
        </div>
    );
}

export default AreaChartGradient;