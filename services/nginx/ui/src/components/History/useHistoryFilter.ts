import { useCallback, useMemo } from "react";
import { ParamKeyValuePair } from "react-router-dom";
import {
    DateFilter,
    jsonDateConverter,
    parseDateQuery,
    toDateQuery,
    useDateFilter,
    useUrlFilter,
} from "../../hooks/Filters";
import { MessageFilterType, MessageTypeFilters } from "../Components/MessageTypeFilter";

export interface Filters extends MessageTypeFilters, DateFilter {}

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
        jsonDateConverter<Filters>
    );

    const onMessageTypeFilterChange = useCallback(
        (type: MessageFilterType, value: string) =>
            setFilters((currentFilter) => ({ ...currentFilter, [type]: value })),
        [setFilters]
    );

    const { onStartDateFilterChange, onEndDateFilterChange } = useDateFilter(setFilters);

    return {
        filters,
        onClear,
        onStartDateFilterChange,
        onEndDateFilterChange,
        onMessageTypeFilterChange,
    };
}

function parseQuery(query: URLSearchParams, defaults: Filters): Filters {
    return {
        action: query.get("action") ?? defaults.action,
        entity: query.get("entity") ?? defaults.entity,
        type: query.get("type") ?? defaults.type,
        ...parseDateQuery(query, defaults),
    };
}

function toQuery(filters: Filters): ParamKeyValuePair[] {
    return [
        ["action", filters.action ?? ""],
        ["entity", filters.entity ?? ""],
        ["type", filters.type ?? ""],
        ...toDateQuery(filters),
    ];
}
