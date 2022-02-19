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
import { useGetHistoryRange } from "../../hooks/history";
import useOrientation from "../../hooks/orientation";
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
    const { isLandscape } = useOrientation();

    const { isHistoryLoading, history } = useGetHistoryRange(
        api,
        start,
        end,
        "event",
        entity,
        action
    );

    const datasets = history?.reduce<Dataset[]>((datasets, record) => {
        // check this data point actually has data that we're looking for
        if (record.message && "value" in record.message && "unit" in record.message) {
            const message = record.message as { unit: string; value: number };

            // find the dataset
            let dataset = datasets.find(
                (dataset) =>
                    dataset.entity.toLowerCase() === record.entity.toLowerCase() &&
                    dataset.action.toLowerCase() === record.action.toLowerCase() &&
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
        }

        return datasets;
    }, []);

    // add the time axis by default
    const scales: {
        [key: string]: {
            [key: string]: unknown;
            max?: number;
        };
    } = {
        time: {
            axis: isLandscape ? "x" : "y",
            type: "time" as const,
            time: {
                minUnit: "minute",
            },
            reverse: !isLandscape,
        },
    };

    // generate the chart options
    const options: ChartOptions<"line"> = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            tooltip: {
                callbacks: {
                    title: (context) =>
                        context.map((item) => (isLandscape ? item.label : item.formattedValue)),
                    label: (context) => {
                        const value = isLandscape ? context.parsed.y : context.parsed.x;
                        const unit = datasets && datasets[context.datasetIndex].unit;
                        return `${value} ${unit}`;
                    },
                },
            },
        },
        scales: datasets?.reduce((scales, dataset, i) => {
            const key = `${dataset.action}-${dataset.unit}`.toLowerCase();

            if (!scales[key]) {
                scales[key] = {
                    axis: isLandscape ? "y" : "x",
                    title: {
                        display: true,
                        text: dataset.unit ? `${dataset.action} (${dataset.unit})` : dataset.action,
                    },
                    type: "linear" as const,
                    position: isLandscape
                        ? Object.keys(scales).length % 2 === 1
                            ? ("left" as const)
                            : ("right" as const)
                        : "bottom",
                    grid: {
                        drawOnChartArea: i === 0,
                    },
                    beginAtZero: true,
                    ticks: {
                        includeBounds: false,
                    },
                };
            }

            // ensure the max still applies with this dataset
            let max =
                dataset.data.reduce((max, point) => (point.value > max ? point.value : max), 0) *
                1.2;
            if (max > 10) {
                max = Math.ceil(max);
            }
            scales[key].max = Math.max(max, scales[key].max ?? 0);

            return scales;
        }, scales),
    };

    // extract the data points
    const data = {
        datasets:
            datasets?.map((dataset, i) => ({
                label: `${dataset.entity} ${dataset.action}`,
                data: dataset.data.map((data) => ({
                    x: isLandscape ? data.timestamp : data.value,
                    y: isLandscape ? data.value : data.timestamp,
                })),
                xAxisID: isLandscape ? "time" : `${dataset.action}-${dataset.unit}`.toLowerCase(),
                yAxisID: isLandscape ? `${dataset.action}-${dataset.unit}`.toLowerCase() : "time",
                backgroundColor: colours[i],
                borderColor: colours[i],
                borderWidth: 1,
                pointRadius: 2,
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
