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
    Tooltip
);

const colours = ["#003f5c", "#bc5090", "#ff6361", "#ffa600", "#58508d"];

interface DataPoint {
    value: number;
    timestamp: Date;
}

interface Dataset {
    entity: string;
    action: string;
    unit: string | undefined;
    data: DataPoint[];
}

interface ChartProps {
    api: PowerPiApi;
    start?: Date;
    end?: Date;
    entity?: string;
    action?: string;
}

const Chart = ({ api, start, end, entity, action }: ChartProps) => {
    const { isHistoryLoading, history } = useGetHistoryRange(
        api,
        start,
        end,
        "event",
        entity,
        action
    );

    const datasets = history?.reduce<Dataset[]>((datasets, record) => {
        const message = record.message as { unit: string; value: number };

        // find the dataset
        let dataset = datasets.find(
            (dataset) =>
                dataset.entity === record.entity &&
                dataset.action === record.action &&
                dataset.unit == message.unit
        );

        if (!dataset) {
            // create the dataset
            dataset = {
                entity: record.entity,
                action: record.action,
                unit: message.unit,
                data: [],
            };

            datasets.push(dataset);
        }

        // add the record
        if (record.message && record.timestamp) {
            dataset.data.push({
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
        scales: datasets?.reduce((scales, dataset, i) => {
            const key = `y-${dataset.action}-${dataset.unit}`;

            if (!scales[key]) {
                scales[key] = {
                    title: {
                        display: true,
                        text: dataset.unit ? `${dataset.action} (${dataset.unit})` : dataset.action,
                    },
                    type: "linear" as const,
                    position:
                        Object.keys(scales).length % 2 === 1
                            ? ("left" as const)
                            : ("right" as const),
                    grid: {
                        drawOnChartArea: i === 0,
                    },
                    beginAtZero: true,
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
                yAxisID: `y-${dataset.action}-${dataset.unit}`,
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
