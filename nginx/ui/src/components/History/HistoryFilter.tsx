import { PowerPiApi } from "@powerpi/api";
import { useCallback } from "react";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useGetHistoryFilters } from "../../hooks/history";
import { MessageFilterType, MessageTypeFilter, MessageTypeFilters } from "../Components";
import styles from "./History.module.scss";

interface HistoryFilterProps {
    api: PowerPiApi;
    updateFilter: (filters: MessageTypeFilters) => void;
}

const HistoryFilter = ({ api, updateFilter }: HistoryFilterProps) => {
    const { actions, entities, types } = useGetHistoryFilters(api);

    const [filters, setFilters] = useState<MessageTypeFilters>({
        type: undefined,
        entity: undefined,
        action: undefined,
    });

    const [query] = useSearchParams();

    useEffect(() => {
        setFilters(parseQuery(query));
    }, [query]);

    useEffect(() => updateFilter(filters), [filters, updateFilter]);

    const selectFilter = useCallback(
        (type: MessageFilterType, value: string) => {
            const newFilter = { ...filters };
            newFilter[type] = value;
            setFilters(newFilter);
        },
        [filters]
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
