import { PowerPiApi } from "@powerpi/api";
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
import { useGetHistoryRange } from "../hooks/history";
import Loading from "./Loading";

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
    unit: string | undefined;
    value: number;
    timestamp: Date;
}

interface Dataset {
    entity: string;
    action: string;
    data: DataPoint[];
}

interface ChartProps {
    api: PowerPiApi;
    title: string;
    start?: Date;
    end?: Date;
    entity?: string;
    action?: string;
}

const Chart = ({ api, title, start, end, entity, action }: ChartProps) => {
    const { isHistoryLoading, history } = useGetHistoryRange(
        api,
        start,
        end,
        "event",
        entity,
        action
    );

    const datasets = history?.reduce<Dataset[]>((datasets, record) => {
        // find the dataset
        let dataset = datasets.find(
            (dataset) => dataset.entity === record.entity && dataset.action === record.action
        );

        if (!dataset) {
            // create the dataset
            dataset = {
                entity: record.entity,
                action: record.action,
                data: [],
            };

            datasets.push(dataset);
        }

        // add the record
        if (record.message && record.timestamp) {
            const message = record.message as { unit: string; value: number };

            dataset.data.push({
                unit: message.unit,
                value: message.value,
                timestamp: record.timestamp,
            });
        }

        return datasets;
    }, []);

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
        scales: datasets?.reduce((scales, dataset, i) => {
            const key = `y${dataset.action}`;

            if (!scales[key]) {
                scales[key] = {
                    title: {
                        display: true,
                        text: dataset.data[0]?.unit
                            ? `${dataset.action} (${dataset.data[0].unit})`
                            : dataset.action,
                    },
                    type: "linear" as const,
                    position:
                        Object.keys(scales).length % 2 === 1
                            ? ("left" as const)
                            : ("right" as const),
                    grid: {
                        drawOnChartArea: i === 0,
                    },
                };
            }

            return scales;
        }, scales),
    };

    const data = {
        datasets:
            datasets?.map((dataset, i) => ({
                label: `${dataset.entity} ${dataset.action}`,
                data: dataset.data.map((data) => ({ x: data.timestamp, y: data.value })),
                yAxisID: `y${dataset.action}`,
                backgroundColor: colours[i],
                borderColor: colours[i],
            })) ?? [],
    };

    return (
        <div className="chart">
            <Loading loading={isHistoryLoading}>
                <Line options={options} data={data} />
            </Loading>
        </div>
    );
};
export default Chart;
