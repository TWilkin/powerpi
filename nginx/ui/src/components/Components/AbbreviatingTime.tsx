import { useCallback, useMemo } from "react";
import TimeAgo from "react-timeago";
import useNarrow from "../../hooks/narrow";

interface AbbreviatingTimeProps {
    date: Date | number | string | undefined;
    abbreviate?: boolean;
    undefinedText?: string;
    className?: string;
}

const AbbreviatingTime = ({
    date,
    abbreviate = false,
    undefinedText = "never",
    className,
}: AbbreviatingTimeProps) => {
    const { isNarrow } = useNarrow();

    const formatter = useCallback(
        (value: number, unit: string, suffix: string) => {
            if (isNarrow || abbreviate) {
                unit = pluralise(value, abbreviateUnit(unit));

                return `${value} ${unit}`;
            }

            return `${value} ${pluralise(value, unit)} ${suffix}`;
        },
        [abbreviate, isNarrow]
    );

    const isDateDefined = useMemo(() => {
        if (date !== undefined) {
            const timestamp =
                typeof date === "number"
                    ? (date as number)
                    : date instanceof Date
                    ? (date as Date).getTime()
                    : new Date(date).getTime();

            return timestamp > 24 * 60 * 60 * 1000;
        }
        return false;
    }, [date]);

    return date && isDateDefined ? (
        <TimeAgo
            date={date}
            formatter={formatter}
            title={formatTitle(date)}
            className={className}
        />
    ) : (
        <p className={className}>{undefinedText}</p>
    );
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
