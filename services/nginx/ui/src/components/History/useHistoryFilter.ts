import { useCallback, useMemo } from "react";
import { ParamKeyValuePair } from "react-router-dom";
import { useUrlFilter } from "../../hooks/Filters";
import { MessageFilterType, MessageTypeFilters } from "../Components/MessageTypeFilter";

export default function useHistoryFilter() {
    const naturalDefaults = useMemo(
        () => ({ action: undefined, entity: undefined, type: undefined }),
        []
    );

    const { filters, setFilters, onClear } = useUrlFilter(
        "history",
        naturalDefaults,
        parseQuery,
        toQuery
    );

    const onMessageTypeFilterChange = useCallback(
        (type: MessageFilterType, value: string) =>
            setFilters((currentFilter) => ({ ...currentFilter, [type]: value })),
        [setFilters]
    );

    return {
        filters,
        onClear,
        onMessageTypeFilterChange,
    };
}

function parseQuery(query: URLSearchParams, defaults: MessageTypeFilters): MessageTypeFilters {
    return {
        action: query.get("action") ?? defaults.action,
        entity: query.get("entity") ?? defaults.entity,
        type: query.get("type") ?? defaults.type,
    };
}

function toQuery(filters: MessageTypeFilters) {
    const params: ParamKeyValuePair[] = [];

    if (filters.action) {
        params.push(["action", filters.action]);
    }

    if (filters.entity) {
        params.push(["entity", filters.entity]);
    }

    if (filters.type) {
        params.push(["type", filters.type]);
    }

    return params;
}
