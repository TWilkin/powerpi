import { PowerPiApi } from "@powerpi/api";
import React, { useEffect, useState } from "react";
import { useGetHistoryFilters } from "../hooks/history";
import MessageTypeFilter, { MessageFilterType, MessageTypeFilters } from "./MessageTypeFilter";

export interface ChartFilters extends MessageTypeFilters {
    start?: Date;
    end?: Date;
}

interface ChartFilterProps {
    api: PowerPiApi;
    updateFilter: (filters: ChartFilters) => void;
}

const ChartFilter = ({ api, updateFilter }: ChartFilterProps) => {
    const { entities, actions } = useGetHistoryFilters(api, "event");

    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    const [filters, setFilters] = useState<ChartFilters>({
        start: yesterday,
        end: today,
        type: undefined,
        entity: undefined,
        action: undefined,
    });

    useEffect(() => updateFilter(filters), [filters]);

    const selectFilter = (type: MessageFilterType, value: string) => {
        const newFilter = { ...filters };
        newFilter[type] = value;
        setFilters(newFilter);
    };

    return (
        <div id="chart-filters">
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
