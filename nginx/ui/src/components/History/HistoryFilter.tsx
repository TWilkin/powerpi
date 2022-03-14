import { useCallback } from "react";
import { useEffect, useState } from "react";
import { ParamKeyValuePair, useSearchParams } from "react-router-dom";
import { useGetHistoryFilters } from "../../hooks/history";
import MessageTypeFilter, {
    MessageTypeFilters,
    MessageFilterType,
} from "../Components/MessageTypeFilter";
import styles from "./HistoryFilter.module.scss";

interface HistoryFilterProps {
    updateFilter: (filters: MessageTypeFilters) => void;
}

const HistoryFilter = ({ updateFilter }: HistoryFilterProps) => {
    const { actions, entities, types } = useGetHistoryFilters();

    const [query, setQuery] = useSearchParams();

    const [filters, setFilters] = useState<MessageTypeFilters>(parseQuery(query));

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

    return (
        <div className={styles.filters}>
            <MessageTypeFilter
                name="Type"
                type="type"
                options={types.data}
                defaultSelected={filters.type}
                onSelect={selectFilter}
                loading={types.isLoading}
                error={types.isError}
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
export default HistoryFilter;

function parseQuery(query: URLSearchParams): MessageTypeFilters {
    return {
        type: query.get("type") ?? undefined,
        entity: query.get("entity") ?? undefined,
        action: query.get("action") ?? undefined,
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
