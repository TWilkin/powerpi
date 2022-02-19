import { PowerPiApi } from "@powerpi/api";
import queryString from "query-string";
import React, { useEffect, useState } from "react";
import { useGetHistoryFilters } from "../../hooks/history";
import MessageTypeFilter, {
    MessageFilterType,
    MessageTypeFilters,
} from "../Components/MessageTypeFilter";

interface HistoryFilterProps {
    api: PowerPiApi;
    query?: string;
    updateFilter: (filters: MessageTypeFilters) => void;
}

const HistoryFilter = ({ api, query, updateFilter }: HistoryFilterProps) => {
    const { actions, entities, types } = useGetHistoryFilters(api);

    const [filters, setFilters] = useState<MessageTypeFilters>({
        type: undefined,
        entity: undefined,
        action: undefined,
    });

    useEffect(() => {
        setFilters(parseQuery(query));
    }, [query]);

    useEffect(() => updateFilter(filters), [filters, updateFilter]);

    const selectFilter = (type: MessageFilterType, value: string) => {
        const newFilter = { ...filters };
        newFilter[type] = value;
        setFilters(newFilter);
    };

    return (
        <div id="history-filters">
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

function parseQuery(query: string | undefined): MessageTypeFilters {
    const parsed = query ? queryString.parse(query) : undefined;

    return {
        type: (parsed?.type ?? undefined) as string | undefined,
        entity: (parsed?.entity ?? undefined) as string | undefined,
        action: (parsed?.action ?? undefined) as string | undefined,
    };
}
