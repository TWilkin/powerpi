import { PowerPiApi } from "@powerpi/api";
import React, { useEffect, useState } from "react";
import { useCallback } from "react";
import { useGetHistoryFilters } from "../../hooks/history";
import DateFilter from "../Components/DateFilter";
import MessageTypeFilter, { MessageFilterType, MessageTypeFilters } from "../MessageTypeFilter";

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

    const now = new Date();
    const lastHour = new Date();
    lastHour.setHours(now.getHours() - 1);

    const [filters, setFilters] = useState<ChartFilters>({
        start: lastHour,
        end: now,
        type: undefined,
        entity: undefined,
        action: undefined,
    });

    useEffect(() => updateFilter(filters), [filters, updateFilter]);

    const selectFilter = useCallback(
        (type: MessageFilterType, value: string) => {
            const newFilter = { ...filters };
            newFilter[type] = value;
            setFilters(newFilter);
        },
        [filters]
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
        <div id="chart-filters">
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
