import { faFilterCircleXmark } from "@fortawesome/free-solid-svg-icons";
import { MouseEventHandler } from "react";
import { useGetHistoryFilters } from "../../hooks/history";
import Button from "../Components/Button";
import DateFilter from "../Components/DateFilter";
import FilterGroup from "../Components/FilterGroup";
import MessageTypeFilter, { MessageFilterType } from "../Components/MessageTypeFilter";
import { Filters } from "./useChartFilter";

interface ChartFilterProps {
    filters: Filters;
    onStartDateFilterChange: (value: Date | null | undefined) => void;
    onEndDateFilterChange: (value: Date | null | undefined) => void;
    onMessageTypeFilterChange: (type: MessageFilterType, value: string) => void;
    onClear: MouseEventHandler<HTMLButtonElement>;
}

const ChartFilter = ({
    filters,
    onStartDateFilterChange,
    onEndDateFilterChange,
    onMessageTypeFilterChange,
    onClear,
}: ChartFilterProps) => {
    const { entities, actions } = useGetHistoryFilters("event");

    return (
        <>
            <FilterGroup>
                <DateFilter
                    name="From"
                    selected={filters.start}
                    onChange={onStartDateFilterChange}
                />

                <DateFilter name="To" selected={filters.end} onChange={onEndDateFilterChange} />
            </FilterGroup>

            <FilterGroup>
                <MessageTypeFilter
                    name="Entity"
                    type="entity"
                    options={entities.data}
                    selected={filters.entity}
                    onSelect={onMessageTypeFilterChange}
                    loading={entities.isLoading}
                    error={entities.isError}
                />

                <MessageTypeFilter
                    name="Action"
                    type="action"
                    options={actions.data}
                    selected={filters.action}
                    onSelect={onMessageTypeFilterChange}
                    loading={actions.isLoading}
                    error={actions.isError}
                />
            </FilterGroup>

            <Button text="Clear" icon={faFilterCircleXmark} onClick={onClear} />
        </>
    );
};
export default ChartFilter;
