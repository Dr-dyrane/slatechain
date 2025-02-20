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

    // console.log(data);
    // {
    //     "title": "Monthly Demand Forecast",
    //     "xAxisKey": "date",
    //     "yAxisKey": "quantity",
    //     "upperKey": "confidenceIntervalUpper",
    //     "lowerKey": "confidenceIntervalLower",
    //     "data": [
    //         {
    //             "date": "2024-08-01",
    //             "quantity": 120,
    //             "confidenceIntervalUpper": 150,
    //             "confidenceIntervalLower": 90
    //         },
    //         {
    //             "date": "2024-09-01",
    //             "quantity": 180,
    //             "confidenceIntervalUpper": 220,
    //             "confidenceIntervalLower": 140
    //         },
    //         {
    //             "date": "2024-10-01",
    //             "quantity": 80,
    //             "confidenceIntervalUpper": 100,
    //             "confidenceIntervalLower": 60
    //         },
    //         {
    //             "date": "2024-11-01",
    //             "quantity": 150,
    //             "confidenceIntervalUpper": 170,
    //             "confidenceIntervalLower": 130
    //         },
    //         {
    //             "date": "2024-12-01",
    //             "quantity": 200,
    //             "confidenceIntervalUpper": 250,
    //             "confidenceIntervalLower": 150
    //         }
    //     ]
    // }

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
                        <linearGradient id="lowerGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#FFBB28" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#FFBB28" stopOpacity={0} />
                        </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey={data.xAxisKey} />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey={data.yAxisKey} stroke="#8884d8" fillOpacity={1} fill="url(#quantityGradient)" />
                <Area type="monotone" dataKey={data.upperKey} stroke="#82ca9d" fillOpacity={1} fill="url(#upperGradient)" />
                <Area type="monotone" dataKey={data.lowerKey} stroke="#a4de6c" fillOpacity={1} fill="url(#lowerGradient)" />
            </AreaChart>
        </ResponsiveContainer>
    );
}

export default AreaChartGradient;