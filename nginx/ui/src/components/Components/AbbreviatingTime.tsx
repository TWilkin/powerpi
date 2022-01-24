import React from "react";
import { useCallback } from "react";
import TimeAgo from "react-timeago";
import useNarrow from "../../hooks/narrow";

interface AbbreviatingTimeProps {
    date: Date | number | string | undefined;
    undefinedText?: string;
}

const AbbreviatingTime = ({ date, undefinedText = "Unknown" }: AbbreviatingTimeProps) => {
    const { isNarrow } = useNarrow();

    const formatter = useCallback(
        (value: number, unit: string, suffix: string) => {
            if (isNarrow) {
                unit = pluralise(value, abbreviateUnit(unit));

                return `${value} ${unit}`;
            }

            return `${value} ${pluralise(value, unit)} ${suffix}`;
        },
        [isNarrow]
    );

    if (date !== undefined) {
        return <TimeAgo date={date} formatter={formatter} title={formatTitle(date)} />;
    }

    return <>{undefinedText}</>;
};
export default AbbreviatingTime;

function abbreviateUnit(unit: string) {
    switch (unit) {
        case "second":
            return "sec";

        case "minute":
            return "min";

        default:
            return unit;
    }
}

function pluralise(value: number, unit: string) {
    if (value !== 1) {
        return `${unit}s`;
    }

    return unit;
}

function formatTitle(date: Date | number | string) {
    const value = typeof date === "number" || typeof date === "string" ? new Date(date) : date;

    return `${value.toLocaleDateString()} ${value.toLocaleTimeString()}`;
}
