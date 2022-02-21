import { useEffect, useState } from "react";
import { useCallback } from "react";
import { ParamKeyValuePair, useSearchParams } from "react-router-dom";
import { useGetHistoryFilters } from "../../hooks/history";
import DateFilter from "../Components/DateFilter";
import MessageTypeFilter, {
    MessageFilterType,
    MessageTypeFilters,
} from "../Components/MessageTypeFilter";
import styles from "./ChartFilter.module.scss";

export interface ChartFilters extends MessageTypeFilters {
    start?: Date;
    end?: Date;
}

interface ChartFilterProps {
    updateFilter: (filters: ChartFilters) => void;
}

const ChartFilter = ({ updateFilter }: ChartFilterProps) => {
    const { entities, actions } = useGetHistoryFilters("event");

    const [query, setQuery] = useSearchParams();

    const [filters, setFilters] = useState<ChartFilters>(parseQuery(query));

    useEffect(() => setFilters(parseQuery(query)), [query]);

    useEffect(() => updateFilter(filters), [filters, updateFilter]);

    const selectFilter = useCallback(
        (type: MessageFilterType, value: string) => {
            const newFilter = { ...filters };
            newFilter[type] = value;
            setFilters(newFilter);
            setQuery(toQuery(newFilter));
        },
        [filters, setQuery]
    );

    const selectDateFilter = useCallback(
        (type: "start" | "end", value: Date | null | undefined) => {
            const newFilter = { ...filters };
            newFilter[type] = value ?? undefined;
            setFilters(newFilter);
        },
        [filters]
    );

    return (
        <div className={styles.filters}>
            <DateFilter
                name="From"
                selected={filters.start}
                onChange={(date) => selectDateFilter("start", date)}
            />
            <DateFilter
                name="To"
                selected={filters.end}
                onChange={(date) => selectDateFilter("end", date)}
            />
            <MessageTypeFilter
                name="Entity"
                type="entity"
                options={entities.data}
                defaultSelected={filters.entity}
                onSelect={selectFilter}
                loading={entities.isLoading}
                error={entities.isError}
            />
            <MessageTypeFilter
                name="Action"
                type="action"
                options={actions.data}
                defaultSelected={filters.action}
                onSelect={selectFilter}
                loading={actions.isLoading}
                error={actions.isError}
            />
        </div>
    );
};
export default ChartFilter;

function parseQuery(query: URLSearchParams): ChartFilters {
    const start = query.get("start");
    const end = query.get("end");

    const now = new Date();
    const lastHour = new Date();
    lastHour.setHours(now.getHours() - 1);

    return {
        type: undefined,
        entity: query.get("entity") ?? undefined,
        action: query.get("action") ?? undefined,
        start: start ? new Date(start) : lastHour,
        end: end ? new Date(end) : now,
    };
}

function toQuery(filters: ChartFilters) {
    const params: ParamKeyValuePair[] = [];

    if (filters.action) {
        params.push(["action", filters.action]);
    }

    if (filters.entity) {
        params.push(["entity", filters.entity]);
    }

    if (filters.start) {
        params.push(["start", filters.start.toISOString()]);
    }

    if (filters.end) {
        params.push(["end", filters.end.toISOString()]);
    }

    return params;
}
