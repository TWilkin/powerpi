import { useCallback } from "react";
import { ParamKeyValuePair } from "react-router-dom";

export interface DateFilter {
    start?: Date | null;
    end?: Date | null;
}

export function useDateFilter<TFilter extends DateFilter>(
    setFilters: (callback: (currentFilter: TFilter) => TFilter) => void
) {
    const onDateFilterChange = useCallback(
        (type: "start" | "end", value: Date | null | undefined) =>
            setFilters((currentFilter) => ({ ...currentFilter, [type]: value ?? undefined })),
        [setFilters]
    );

    const onStartDateFilterChange = useCallback(
        (value: Date | null | undefined) => onDateFilterChange("start", value),
        [onDateFilterChange]
    );

    const onEndDateFilterChange = useCallback(
        (value: Date | null | undefined) => onDateFilterChange("end", value),
        [onDateFilterChange]
    );

    return {
        onStartDateFilterChange,
        onEndDateFilterChange,
    };
}

export function parseDateQuery(
    query: URLSearchParams,
    defaults: DateFilter,
    useDefaults = true
): DateFilter {
    const start = query.get("start");
    const end = query.get("end");

    return {
        start: start && start !== "" ? new Date(start) : useDefaults ? defaults.start : undefined,
        end: end && end !== "" ? new Date(end) : useDefaults ? defaults.end : undefined,
    };
}

export function toDateQuery(filters: DateFilter): ParamKeyValuePair[] {
    return [
        ["start", filters.start?.toISOString() ?? ""],
        ["end", filters.end?.toISOString() ?? ""],
    ];
}

export function jsonDateConverter<TFilter extends DateFilter>(obj: {
    [key in keyof TFilter]: string;
}) {
    return {
        ...obj,
        start: obj.start && obj.start !== "" ? new Date(obj.start) : undefined,
        end: obj.end && obj.end !== "" ? new Date(obj.end) : undefined,
    };
}
