import { faExclamation } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { PowerPiApi } from "powerpi-common-api";
import queryString from "query-string";
import React, { FormEvent, useEffect, useState } from "react";
import { useGetHistoryFilters } from "../hooks/history";
import Loading from "./Loading";

type FilterType = "type" | "entity" | "action";

export interface Filters {
  type: string | undefined;
  entity: string | undefined;
  action: string | undefined;
}

interface HistoryFilterProps {
  api: PowerPiApi;
  query?: string;
  updateFilter: (filters: Filters) => void;
}

const HistoryFilter = ({ api, query, updateFilter }: HistoryFilterProps) => {
  const { actions, entities, types } = useGetHistoryFilters(api);

  const [filters, setFilters] = useState<Filters>({
    type: undefined,
    entity: undefined,
    action: undefined
  });

  useEffect(() => {
    setFilters(parseQuery(query));
  }, []);

  useEffect(() => updateFilter(filters), [filters]);

  const selectFilter = (type: FilterType, value: string) => {
    const newFilter = { ...filters };
    newFilter[type] = value;
    setFilters(newFilter);
  };

  return (
    <div id="history-filters">
      <Filter
        name="Type"
        type="type"
        options={types.data}
        defaultSelected={filters.type}
        onSelect={selectFilter}
        loading={types.isLoading}
        error={types.isError}
      />
      <Filter
        name="Entity"
        type="entity"
        options={entities.data}
        defaultSelected={filters.entity}
        onSelect={selectFilter}
        loading={entities.isLoading}
        error={entities.isError}
      />
      <Filter
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

interface FilterProps {
  name: string;
  type: FilterType;
  options?: string[];
  defaultSelected?: string;
  onSelect: (type: FilterType, value: string) => void;
  loading: boolean;
  error: boolean;
}

const Filter = ({
  name,
  type,
  options,
  defaultSelected,
  onSelect,
  loading,
  error
}: FilterProps) => {
  const handleFilterChange = (event: FormEvent<HTMLSelectElement>) => {
    const value = event.currentTarget.value ?? "";
    onSelect(type, value);
  };

  return (
    <div>
      <label htmlFor={`${type}-filter`}>{name}: </label>

      <Loading loading={loading}>
        {error ? (
          <FontAwesomeIcon icon={faExclamation} />
        ) : (
          <select
            name={`${type}-filter`}
            onChange={handleFilterChange}
            defaultValue={defaultSelected}
          >
            <option value="">-</option>
            {options?.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        )}
      </Loading>
    </div>
  );
};

function parseQuery(query: string | undefined): Filters {
  const parsed = query ? queryString.parse(query) : undefined;

  return {
    type: (parsed?.type ?? undefined) as string | undefined,
    entity: (parsed?.entity ?? undefined) as string | undefined,
    action: (parsed?.action ?? undefined) as string | undefined
  };
}
