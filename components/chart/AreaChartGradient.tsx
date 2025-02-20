"use client";
import React from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AreaChartData, ForecastDataPoint } from "@/lib/types";

interface AreaChartGradientProps {
    data: AreaChartData | null;
}

function AreaChartGradient({ data }: AreaChartGradientProps) {
    if (!data || !data.data || data.data.length === 0) {
        return <p>No data to display</p>;
    }

    return (
        <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data.data}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                    <linearGradient id="quantityGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="confidenceGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#82ca9d" stopOpacity={0} />
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey={data.xAxisKey} />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey={data.yAxisKey} stroke="#8884d8" fillOpacity={1} fill="url(#quantityGradient)" />
                <Area type="monotone" dataKey={data.upperKey} stroke="#82ca9d" fillOpacity={1} fill="url(#confidenceGradient)" />
                <Area type="monotone" dataKey={data.lowerKey} stroke="#82ca9d" fillOpacity={1} fill="url(#confidenceGradient)" />
            </AreaChart>
        </ResponsiveContainer>
    );
}

export default AreaChartGradient;