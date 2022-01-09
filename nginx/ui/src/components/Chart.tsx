import {
    CategoryScale,
    Chart as ChartJS,
    ChartOptions,
    Legend,
    LinearScale,
    LineElement,
    PointElement,
    TimeSeriesScale,
    Title,
    Tooltip,
} from "chart.js";
import "chartjs-adapter-luxon";
import React from "react";
import { Line } from "react-chartjs-2";

ChartJS.register(
    CategoryScale,
    Legend,
    LinearScale,
    LineElement,
    PointElement,
    TimeSeriesScale,
    Title,
    Tooltip
);

const colours = ["#003f5c", "#bc5090", "#ff6361", "#ffa600", "#58508d"];

interface DataPoint {
    unit: string;
    timestamp: number;
    value: number;
}

interface Dataset {
    title: string;
    data: DataPoint[];
}

interface ChartProps {
    title: string;
    datasets: Dataset[];
}

const Chart = ({ title, datasets }: ChartProps) => {
    const scales: { [key: string]: object } = {
        x: {
            type: "timeseries" as const,
            time: {
                minUnit: "minute",
            },
        },
    };

    const options: ChartOptions<"line"> = {
        plugins: {
            title: {
                display: true,
                text: title,
            },
        },
        scales: datasets.reduce((scales, dataset, i) => {
            const title = dataset.data[0]
                ? `${dataset.title} (${dataset.data[0]?.unit})`
                : dataset.title;

            scales[`y${i}`] = {
                title: {
                    display: true,
                    text: title,
                },
                type: "linear" as const,
                position: i % 2 === 0 ? ("left" as const) : ("right" as const),
                grid: {
                    drawOnChartArea: i === 0,
                },
            };

            return scales;
        }, scales),
    };

    const data = {
        datasets: datasets.map((dataset, i) => ({
            label: dataset.title,
            data: dataset.data.map((data) => ({ x: data.timestamp, y: data.value })),
            yAxisID: `y${i}`,
            backgroundColor: colours[i],
            borderColor: colours[i],
        })),
    };

    return (
        <div className="chart">
            <Line options={options} data={data} />
        </div>
    );
};
export default Chart;
