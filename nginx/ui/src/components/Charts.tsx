import React from "react";
import Chart from "./Chart";

const now = new Date();

const Charts = () => {
    return (
        <div id="charts">
            <Chart
                title="Example Chart"
                datasets={[
                    {
                        title: "temperature",
                        data: [19.9, 20.1, 20.1, 20.3, 20.5].map((v, i) => ({
                            timestamp: now.getTime() - i * 1000 * 60 * 5,
                            value: v,
                            unit: "C",
                        })),
                    },
                    {
                        title: "humidity",
                        data: [45, 45, 45.3, 44.8].map((v, i) => ({
                            timestamp: now.getTime() - i * 1000 * 60 * 5,
                            value: v,
                            unit: "%",
                        })),
                    },
                ]}
            />
        </div>
    );
};
export default Charts;
