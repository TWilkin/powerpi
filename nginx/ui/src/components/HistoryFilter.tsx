import { faFilter } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import queryString from "query-string";
import React, { FormEvent, useEffect, useState } from "react";

import { Api } from "../api";

type FilterType = "type" | "entity" | "action";

export interface Filters {
  type: string | undefined;
  entity: string | undefined;
  action: string | undefined;
}

interface HistoryFilterProps {
  api: Api;
  query?: string;
  updateFilter: (filters: Filters) => void;
}

const HistoryFilter = ({ api, query, updateFilter }: HistoryFilterProps) => {
  const [types, setTypes] = useState<string[]>([]);
  const [entities, setEntities] = useState<string[]>([]);
  const [actions, setActions] = useState<string[]>([]);
  const [filters, setFilters] = useState<Filters>({
    type: undefined,
    entity: undefined,
    action: undefined
  });

  useEffect(() => {
    setFilters(parseQuery(query));

    (async () => {
      const [typeList, entityList, actionList] = await Promise.all([
        api.getHistoryTypes(),
        api.getHistoryEntities(),
        api.getHistoryActions()
      ]);

      setTypes(typeList.map((row) => row.type));
      setEntities(entityList.map((row) => row.entity));
      setActions(actionList.map((row) => row.action));
    })();
  }, []);

  useEffect(() => updateFilter(filters), [filters]);

  const selectFilter = (type: FilterType, value: string) => {
    const newFilter = { ...filters };
    newFilter[type] = value;
    setFilters(newFilter);
  };

  return (
    <div id="history-filters" className="filters">
      <FontAwesomeIcon icon={faFilter} />
      <Filter
        name="Type"
        type="type"
        options={types}
        defaultSelected={filters.type}
        onSelect={selectFilter}
      />
      <Filter
        name="Entity"
        type="entity"
        options={entities}
        defaultSelected={filters.entity}
        onSelect={selectFilter}
      />
      <Filter
        name="Action"
        type="action"
        options={actions}
        defaultSelected={filters.action}
        onSelect={selectFilter}
      />
    </div>
  );
};

export default HistoryFilter;

interface FilterProps {
  name: string;
  type: FilterType;
  options: string[];
  defaultSelected?: string;
  onSelect: (type: FilterType, value: string) => void;
}

const Filter = ({
  name,
  type,
  options,
  defaultSelected,
  onSelect
}: FilterProps) => {
  const handleFilterChange = (event: FormEvent<HTMLSelectElement>) => {
    const value = event.currentTarget.value ?? "";
    onSelect(type, value);
  };

  return (
    <>
      <label htmlFor={`${type}-filter`}>
        {name} {defaultSelected}:
      </label>

      <select
        name={`${type}-filter`}
        onChange={handleFilterChange}
        defaultValue={defaultSelected}
      >
        <option value="">-</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </>
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
