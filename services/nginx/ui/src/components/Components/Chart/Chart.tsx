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
import { useMemo } from "react";
import { Line } from "react-chartjs-2";
import { chain as _ } from "underscore";
import useColourMode from "../../../hooks/colour";
import { useGetHistoryRange } from "../../../hooks/history";
import useOrientation from "../../../hooks/orientation";
import scss from "../../../styles/exports.module.scss";
import { getFormattedUnit, getFormattedValue } from "../FormattedValue";
import Loading from "../Loading";
import styles from "./Chart.module.scss";

ChartJS.register(
    CategoryScale,
    Legend,
    LinearScale,
    LineElement,
    PointElement,
    TimeSeriesScale,
    Tooltip
);

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
    start?: Date;
    end?: Date;
    entity?: string;
    action?: string;
}

const Chart = ({ start, end, entity, action }: ChartProps) => {
    const { isLandscape } = useOrientation();
    const { isDark } = useColourMode();

    const { isHistoryLoading, history } = useGetHistoryRange(start, end, "event", entity, action);

    const datasets = useMemo(
        () =>
            history?.reduce<Dataset[]>((datasets, record) => {
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

                return _(datasets)
                    .sortBy((dataset) => dataset.entity)
                    .sortBy((dataset) => dataset.action)
                    .value();
            }, []),
        [history]
    );

    // set the chart colours in light/dark mode
    const { textColour, lineColour, tooltipColour, lineColours } = useMemo(() => {
        const lineColourRegex = /,\s*/;

        if (isDark) {
            return {
                textColour: scss.darkText,
                lineColour: scss.darkChartLine,
                tooltipColour: scss.darkMenu,
                lineColours: scss.darkChart.split(lineColourRegex),
            };
        }

        return {
            textColour: scss.lightText,
            lineColour: scss.lightChartLine,
            tooltipColour: scss.lightMenu,
            lineColours: scss.lightChart.split(lineColourRegex),
        };
    }, [isDark]);

    // add the time axis by default
    const scales: {
        [key: string]: {
            [key: string]: unknown;
            min?: number;
            max?: number;
        };
    } = useMemo(
        () => ({
            time: {
                axis: isLandscape ? "x" : "y",
                type: "time",
                time: {
                    minUnit: "minute",
                },
                reverse: !isLandscape,
                grid: {
                    color: lineColour,
                    borderColor: lineColour,
                },
                ticks: {
                    color: textColour,
                },
            },
        }),
        [isLandscape, lineColour, textColour]
    );

    // generate the chart options
    const options: ChartOptions<"line"> = useMemo(
        () => ({
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        color: textColour,
                    },
                },
                tooltip: {
                    titleColor: textColour,
                    bodyColor: textColour,
                    backgroundColor: tooltipColour,
                    callbacks: {
                        title: (context) =>
                            context.map((item) => (isLandscape ? item.label : item.formattedValue)),
                        label: (context) => {
                            const value = isLandscape ? context.parsed.y : context.parsed.x;
                            const formatted =
                                datasets && datasets[context.datasetIndex].unit
                                    ? getFormattedValue(value, datasets[context.datasetIndex].unit)
                                    : value;
                            return `${formatted ?? value}`;
                        },
                    },
                },
            },
            scales: datasets?.reduce((scales, dataset, i) => {
                const key = `${dataset.action}-${dataset.unit}`.toLowerCase();
                const formattedUnit = dataset.unit ? getFormattedUnit(dataset.unit) : undefined;

                if (!scales[key]) {
                    scales[key] = {
                        axis: isLandscape ? "y" : "x",
                        title: {
                            display: true,
                            text: dataset.unit
                                ? `${dataset.action} (${formattedUnit})`
                                : dataset.action,
                            color: textColour,
                        },
                        type: "linear" as const,
                        position: isLandscape
                            ? Object.keys(scales).length % 2 === 1
                                ? ("left" as const)
                                : ("right" as const)
                            : "bottom",
                        grid: {
                            drawOnChartArea: i === 0,
                            color: lineColour,
                            borderColor: lineColour,
                        },
                        ticks: {
                            includeBounds: false,
                            color: textColour,
                        },
                    };
                }

                // ensure the min/max still applies with this dataset
                const points = dataset.data.map((point) => point.value);
                let min = Math.min(...points, Number.MAX_VALUE);
                let max = Math.max(...points, Number.MIN_VALUE);

                // add a bit of padding to the range
                const padding = max === min ? Math.max(max, min) : (max - min) / 5;
                min -= padding / 5;
                max += padding / 5;

                scales[key].min = Math.min(min, scales[key].min ?? max);
                scales[key].max = Math.max(max, scales[key].max ?? min);

                return scales;
            }, scales),
        }),
        [datasets, isLandscape, lineColour, scales, textColour, tooltipColour]
    );

    // extract the data points
    const data = useMemo(
        () => ({
            datasets:
                datasets?.map((dataset, i) => ({
                    label: `${dataset.entity} ${dataset.action}`,
                    data: dataset.data.map((data) => ({
                        x: isLandscape ? data.timestamp : data.value,
                        y: isLandscape ? data.value : data.timestamp,
                    })),
                    xAxisID: isLandscape
                        ? "time"
                        : `${dataset.action}-${dataset.unit}`.toLowerCase(),
                    yAxisID: isLandscape
                        ? `${dataset.action}-${dataset.unit}`.toLowerCase()
                        : "time",
                    backgroundColor: lineColours[i],
                    borderColor: lineColours[i],
                    borderWidth: 1,
                    pointRadius: 2,
                })) ?? [],
        }),
        [datasets, isLandscape, lineColours]
    );

    return (
        <div className={styles.chart}>
            <Loading loading={isHistoryLoading}>
                <Line options={options} data={data} />
            </Loading>
        </div>
    );
};
export default Chart;
