import React, { useCallback } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

interface SparklineProps {
    data?: number[];
    type?: "revenue" | "orders" | "number" | string;
}
const Sparkline: React.FC<SparklineProps> = ({ data = [], type = "number" }) => {

    const gradientColor = useCallback((ctx: any) => {
        if (!ctx?.chart?.ctx || !ctx?.chart?.height) return;
        const gradient = ctx.chart.ctx.createLinearGradient(0, 0, 0, ctx.chart.height);
        if (type === 'revenue') {
            gradient.addColorStop(0, 'rgba(77, 233, 130, 0.5)'); // Start color (green)
            gradient.addColorStop(1, 'rgba(77, 233, 130, 0)'); // End color (transparent green)
        } else if (type === 'orders') {
            gradient.addColorStop(0, 'rgba(56, 189, 248, 0.5)');  // Start color (blue)
            gradient.addColorStop(1, 'rgba(56, 189, 248, 0)');   // End color (transparent blue)
        }
        return gradient;
    }, [type]);

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                enabled: false
            }
        },
        scales: {
            x: {
                display: false
            },
            y: {
                display: false,
            }
        },
        elements: {
            line: {
                tension: 0.3,
                borderWidth: 2,
                borderColor: type === "revenue" ? '#4ade80' : '#38bdf8',
                fill: true
            },

        }
    }

    const chartData = {
        labels: data.map((_, i) => i + 1),
        datasets: [
            {
                data: [...data],
                fill: true,
                backgroundColor: gradientColor,
            },
        ],
    };

    return (
        <div className='h-6 w-28'>
            {
                type === "revenue" || type === "orders" ? <Line data={chartData} options={options} /> : null
            }
        </div>

    );
};

export default Sparkline;