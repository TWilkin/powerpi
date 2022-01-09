import { Chart as ChartJS, CategoryScale, LinearScale, LineElement, PointElement } from "chart.js";
import React from "react";
import { Line } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement);

const Chart = () => {
    const options = {
        scales: {
            y1: {
                type: "linear" as const,
                position: "left" as const,
            },
            y2: {
                type: "linear" as const,
                position: "right" as const,
            },
        },
    };

    const data = {
        labels: ["a", "b", "c", "d"],
        datasets: [
            {
                data: [1, 2, 3, 4],
                yAxisID: "y1",
            },
            {
                data: [4, 3, 2, 1],
                yAxisID: "y2",
            },
        ],
    };

    return <Line options={options} data={data} />;
};
export default Chart;
