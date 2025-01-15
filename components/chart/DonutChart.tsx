import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

interface DonutChartProps {
    data?: number[];
    labels?: string[];
    colors?: string[];
    title?: string
}

const DonutChart: React.FC<DonutChartProps> = ({ data = [], labels = [], colors = ['#4ade80', '#38bdf8', '#a855f7', '#f97316'], title = "" }) => {
    const chartData = {
        labels: labels,
        datasets: [
            {
                data: [...data],
                backgroundColor: colors,
                borderWidth: 0,
                hoverOffset: 4
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: "bottom" as const,
                labels: {
                    usePointStyle: true,
                    pointStyle: 'circle'
                }
            },
            tooltip: {
                callbacks: {
                    label: function (context: any) {
                        let label = context.label || '';
                        if (label) {
                            label += ': ';
                        }
                        if (context.parsed) {
                            label += context.parsed + ' items';
                        }
                        return label;
                    }
                }
            }
        }

    };

    return (
        <div className="flex flex-col items-center">
            {title ? <h3 className="text-sm font-bold mb-2">{title}</h3> : null}
            <div className='h-28 w-56'>
                <Doughnut data={chartData} options={options} />
            </div>
        </div>
    );
};

export default DonutChart;