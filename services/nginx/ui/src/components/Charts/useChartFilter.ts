import { useCallback, useMemo } from "react";
import { ParamKeyValuePair } from "react-router-dom";
import { useUrlFilter } from "../../hooks/Filters";
import { MessageFilterType, MessageTypeFilters } from "../Components/MessageTypeFilter";

export interface Filters extends Omit<MessageTypeFilters, "type"> {
    start?: Date;
    end?: Date;
}

export default function useChartFilter() {
    // calculate the defaults for the date filters
    const [now, lastHour] = useMemo(() => {
        const now = new Date();

        const lastHour = new Date();
        lastHour.setHours(now.getHours() - 1);

        return [now, lastHour];
    }, []);

    const naturalDefaults = useMemo(
        () => ({
            action: undefined,
            entity: undefined,
            start: lastHour,
            end: now,
        }),
        [lastHour, now]
    );

    const { filters, setFilters, onClear } = useUrlFilter(
        "chart",
        naturalDefaults,
        parseQuery,
        toQuery,
        jsonConverter
    );

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

    const onMessageTypeFilterChange = useCallback(
        (type: MessageFilterType, value: string) =>
            setFilters((currentFilter) => ({ ...currentFilter, [type]: value })),
        [setFilters]
    );

    return {
        filters,
        onClear,
        onStartDateFilterChange,
        onEndDateFilterChange,
        onMessageTypeFilterChange,
    };
}

function parseQuery(query: URLSearchParams, defaults: Filters): Filters {
    const start = query.get("start");
    const end = query.get("end");

    return {
        action: query.get("action") ?? defaults.action,
        entity: query.get("entity") ?? defaults.entity,
        start: start && start !== "" ? new Date(start) : undefined,
        end: end && end !== "" ? new Date(end) : undefined,
    };
}

function toQuery(filters: Filters): ParamKeyValuePair[] {
    return [
        ["action", filters.action ?? ""],
        ["entity", filters.entity ?? ""],
        ["start", filters.start?.toISOString() ?? ""],
        ["end", filters.end?.toISOString() ?? ""],
    ];
}

function jsonConverter(obj: { [key in keyof Filters]: string }) {
    return {
        ...obj,
        start: obj.start && obj.start !== "" ? new Date(obj.start) : undefined,
        end: obj.end && obj.end !== "" ? new Date(obj.end) : undefined,
    };
}
