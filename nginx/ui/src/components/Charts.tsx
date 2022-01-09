import React from "react";
import Chart from "./Chart";

const Charts = () => {
    return (
        <div id="charts">
            <Chart
                title="Example Chart"
                datasets={[
                    { title: "temperature", unit: "C", data: [1, 2, 3, 4] },
                    { title: "humidity", unit: "%", data: [4, 2, 2, 1] },
                ]}
            />
        </div>
    );
};
export default Charts;
