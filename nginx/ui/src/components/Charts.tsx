import { PowerPiApi } from "@powerpi/api";
import React from "react";
import Chart from "./Chart";

interface ChartsProps {
    api: PowerPiApi;
}

const Charts = ({ api }: ChartsProps) => {
    return (
        <div id="charts">
            <Chart
                api={api}
                title="Example Chart"
                entity="Office"
                start={new Date("2021-12-31T23:00:00Z")}
                end={new Date("2021-12-31T23:59:59Z")}
            />
        </div>
    );
};
export default Charts;
