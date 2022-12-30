import { ChartOptions } from "chart.js";
import { useMemo } from "react";
import useOrientation from "../../../hooks/orientation";
import { getFormattedUnit, getFormattedValue } from "../FormattedValue";
import useChartColours from "./useChartColours";
import { Dataset } from "./useHistoryDatasets";

type DatasetChartScale = {
    [key: string]: {
        [key: string]: unknown;
        min?: number;
        max?: number;
    };
};

export default function useChart(datasets?: Dataset[]) {
    const { isLandscape } = useOrientation();

    const { textColour, lineColour, tooltipColour, lineColours } = useChartColours();

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

            scales: {
                // add the time axis by default
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

                // plus the axis for each dataset
                ...datasets?.reduce((scales, dataset, i) => {
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
                            type: "linear",
                            position: isLandscape
                                ? Object.keys(scales).length % 2 === 0
                                    ? "left"
                                    : "right"
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

                    // check if all our values are positive
                    const positive = min > 0;

                    // add a bit of padding to the range
                    const padding = (max === min ? Math.max(max, min) : max - min) / 5;
                    min -= padding;
                    max += padding;

                    // prevent the padding from making min negative if none of the values are
                    if (positive && min < 0) {
                        min = 0;
                    }

                    scales[key].min = Math.min(min, scales[key].min ?? max);
                    scales[key].max = Math.max(max, scales[key].max ?? min);

                    return scales;
                }, {} as DatasetChartScale),
            },
        }),
        [datasets, isLandscape, lineColour, textColour, tooltipColour]
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

    return { options, data };
}
