import { ChartOptions, Tick } from "chart.js";
import { DateTime } from "luxon";
import { useCallback, useMemo } from "react";
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

const dateFormats = [
    "milisecond",
    "second",
    "minute",
    "hour",
    "day",
    "week",
    "month",
    "quarter",
    "year",
];

type DateFormat = {
    [key: string]: {
        resetFormat: string;
        normalFormat: string;
        getCheckValue: (value: DateTime) => number;
    };
};

export default function useChart(datasets?: Dataset[]) {
    const { isLandscape } = useOrientation();

    const { textColour, lineColour, tooltipColour, lineColours } = useChartColours();

    const timeTickGenerator = useTimeTick();

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
                        displayFormats: dateFormats.reduce(
                            (acc, format) => ({
                                ...acc,
                                [format]: `x '${format}'`,
                            }),
                            {}
                        ),
                    },
                    reverse: !isLandscape,
                    grid: {
                        color: lineColour,
                        borderColor: lineColour,
                    },
                    ticks: {
                        autoSkip: false,
                        color: textColour,
                        callback: timeTickGenerator,
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
        [datasets, isLandscape, lineColour, textColour, timeTickGenerator, tooltipColour]
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

function decodeTick(value: string | number) {
    // we encode the scale alongside the format
    const split = `${value}`.split(" ");
    const timestamp = parseInt(split[0]);
    const scale = split[1] ?? "hour";

    return {
        date: DateTime.fromMillis(timestamp),
        scale,
    };
}

function useTimeTick() {
    const { isLandscape } = useOrientation();

    const formats = useMemo<DateFormat>(
        () => ({
            minute: {
                resetFormat: "HH:mm",
                normalFormat: "mm",
                getCheckValue: (value: DateTime) => value?.hour,
            },
            hour: {
                resetFormat: "dd MMM HH",
                normalFormat: "HH",
                getCheckValue: (value: DateTime) => value.day,
            },
        }),
        []
    );

    const maxTicks = useMemo(() => (isLandscape ? 64 : 32), [isLandscape]);

    const getPreviousTickDate = useCallback(
        (autoSkip: number, index: number, ticks: Tick[]) => {
            let previousIndex: number | undefined;

            // when portrait the ticks are in the opposite order
            if (isLandscape) {
                if (index >= autoSkip) {
                    previousIndex = index - autoSkip;
                }
            } else {
                if (index + autoSkip < ticks.length) {
                    previousIndex = index + autoSkip;
                }
            }

            return previousIndex !== undefined
                ? decodeTick(ticks[previousIndex].value).date
                : undefined;
        },
        [isLandscape]
    );

    return useCallback(
        (value: string | number, index: number, ticks: Tick[]) => {
            // decide the auto-skip
            const autoSkip = ticks.length < maxTicks ? 1 : Math.ceil(ticks.length / maxTicks);

            const { date, scale } = decodeTick(value);

            // skip 1 in skip
            if (index % autoSkip !== 0) {
                return undefined;
            }

            // find the previous unskipped date
            const previousDate = getPreviousTickDate(autoSkip, index, ticks);

            // use the format list to generate the tick
            const format = formats[scale];
            if (format) {
                const { resetFormat, normalFormat, getCheckValue } = formats[scale];

                if (!previousDate || getCheckValue(date) !== getCheckValue(previousDate)) {
                    return date.toFormat(resetFormat);
                }
                return date.toFormat(normalFormat);
            }

            return date.toISO();
        },
        [formats, getPreviousTickDate, maxTicks]
    );
}
