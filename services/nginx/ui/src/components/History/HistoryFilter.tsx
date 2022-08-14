import { useGetHistoryFilters } from "../../hooks/history";
import FilterGroup from "../Components/FilterGroup";
import MessageTypeFilter, {
    MessageFilterType,
    MessageTypeFilters,
} from "../Components/MessageTypeFilter";

interface HistoryFilterProps {
    filters: MessageTypeFilters;
    onMessageTypeFilterChange: (type: MessageFilterType, value: string) => void;
}

const HistoryFilter = ({ filters, onMessageTypeFilterChange }: HistoryFilterProps) => {
    const { actions, entities, types } = useGetHistoryFilters();

    return (
        <FilterGroup>
            <MessageTypeFilter
                name="Type"
                type="type"
                options={types.data}
                defaultSelected={filters.type}
                onSelect={onMessageTypeFilterChange}
                loading={types.isLoading}
                error={types.isError}
            />
            <MessageTypeFilter
                name="Entity"
                type="entity"
                options={entities.data}
                defaultSelected={filters.entity}
                onSelect={onMessageTypeFilterChange}
                loading={entities.isLoading}
                error={entities.isError}
            />
            <MessageTypeFilter
                name="Action"
                type="action"
                options={actions.data}
                defaultSelected={filters.action}
                onSelect={onMessageTypeFilterChange}
                loading={actions.isLoading}
                error={actions.isError}
            />
        </FilterGroup>
    );
};
export default HistoryFilter;
