import {
    CategoryScale,
    Chart as ChartJS,
    ChartOptions,
    Legend,
    LinearScale,
    LineElement,
    PointElement,
    Title,
} from "chart.js";
import React from "react";
import { Line } from "react-chartjs-2";

ChartJS.register(CategoryScale, Legend, LinearScale, LineElement, PointElement, Title);

const colours = ["#003f5c", "#bc5090", "#ff6361", "#ffa600", "#58508d"];

interface Dataset {
    title: string;
    unit: string;
    data: number[];
}

interface ChartProps {
    title: string;
    datasets: Dataset[];
}

const Chart = ({ title, datasets }: ChartProps) => {
    const options: ChartOptions<"line"> = {
        plugins: {
            title: {
                display: true,
                text: title,
            },
        },
        scales: datasets.reduce((acc, dataset, i) => {
            acc[`y${i}`] = {
                title: {
                    display: true,
                    text: `${dataset.title} (${dataset.unit})`,
                },
                type: "linear" as const,
                position: i % 2 === 0 ? ("left" as const) : ("right" as const),
            };
            return acc;
        }, {} as { [key: string]: object }),
    };

    const data = {
        labels: ["a", "b", "c", "d"],
        datasets: datasets.map((dataset, i) => ({
            label: dataset.title,
            data: dataset.data,
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
