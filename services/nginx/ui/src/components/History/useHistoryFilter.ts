import { useCallback, useMemo } from "react";
import { ParamKeyValuePair } from "react-router-dom";
import { useUrlFilter } from "../../hooks/Filters";
import { MessageFilterType, MessageTypeFilters } from "../Components/MessageTypeFilter";

export interface Filters extends MessageTypeFilters {
    start?: Date | null;
    end?: Date | null;
}

export default function useHistoryFilter() {
    const naturalDefaults = useMemo(
        () => ({
            action: undefined,
            entity: undefined,
            type: undefined,
            start: null,
            end: null,
        }),
        []
    );

    const { filters, setFilters, onClear } = useUrlFilter(
        "history",
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
        type: query.get("type") ?? defaults.type,
        start: start && start !== "" ? new Date(start) : undefined,
        end: end && end !== "" ? new Date(end) : undefined,
    };
}

function toQuery(filters: Filters): ParamKeyValuePair[] {
    return [
        ["action", filters.action ?? ""],
        ["entity", filters.entity ?? ""],
        ["type", filters.type ?? ""],
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
