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
                        entity: "Office",
                        action: "temperature",
                        data: [19.9, 20.1, 20.1, 20.3, 20.5].map((v, i) => ({
                            timestamp: now.getTime() - i * 1000 * 60 * 5,
                            value: v,
                            unit: "C",
                        })),
                    },
                    {
                        entity: "Hallway",
                        action: "temperature",
                        data: [17, 17.1, 16.9, 16.9, 17].map((v, i) => ({
                            timestamp: now.getTime() - i * 1000 * 60 * 5,
                            value: v,
                            unit: "C",
                        })),
                    },
                    {
                        entity: "Office",
                        action: "humidity",
                        data: [45, 45, 45.3, 44.8].map((v, i) => ({
                            timestamp: now.getTime() - i * 1000 * 60 * 5,
                            value: v,
                            unit: "%",
                        })),
                    },
                    {
                        entity: "Hallway",
                        action: "humidity",
                        data: [45.1, 45, 45.1, 45.1].map((v, i) => ({
                            timestamp: now.getTime() - i * 1000 * 60 * 5,
                            value: v,
                            unit: "%",
                        })),
                    },
                    {
                        entity: "Hallway",
                        action: "motion",
                        data: [1, 1, 0, 0, 0].map((v, i) => ({
                            timestamp: now.getTime() - i * 1000 * 60 * 5,
                            value: v,
                            unit: undefined,
                        })),
                    },
                ]}
            />
        </div>
    );
};
export default Charts;
