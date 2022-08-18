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

export interface Filters extends Omit<MessageTypeFilters, "type">, DateFilter {}

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
        jsonDateConverter<Filters>
    );

    const onMessageTypeFilterChange = useCallback(
        (type: MessageFilterType, value: string) => {
            if (type !== "type") {
                setFilters((currentFilter) => ({ ...currentFilter, [type]: value }));
            }
        },
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
        ...parseDateQuery(query, defaults),
    };
}

function toQuery(filters: Filters): ParamKeyValuePair[] {
    return [
        ["action", filters.action ?? ""],
        ["entity", filters.entity ?? ""],
        ...toDateQuery(filters),
    ];
}
