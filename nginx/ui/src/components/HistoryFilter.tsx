import { faFilter } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
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
  updateFilter: (filters: Filters) => void;
}

const HistoryFilter = ({ api, updateFilter }: HistoryFilterProps) => {
  const [types, setTypes] = useState<string[]>([]);
  const [entities, setEntities] = useState<string[]>([]);
  const [actions, setActions] = useState<string[]>([]);
  const [filters, setFilters] = useState<Filters>({
    type: undefined,
    entity: undefined,
    action: undefined
  });

  useEffect(() => {
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
  });

  const selectFilter = (type: FilterType, value: string) => {
    const newFilter = { ...filters };
    newFilter[type] = value;
    setFilters(newFilter);
    updateFilter(newFilter);
  };

  return (
    <div id="history-filters" className="filters">
      <FontAwesomeIcon icon={faFilter} />
      <Filter name="Type" type="type" options={types} onSelect={selectFilter} />
      <Filter
        name="Entity"
        type="entity"
        options={entities}
        onSelect={selectFilter}
      />
      <Filter
        name="Action"
        type="action"
        options={actions}
        onSelect={selectFilter}
      />
    </div>
  );
};

interface FilterProps {
  name: string;
  type: FilterType;
  options: string[];
  onSelect: (type: FilterType, value: string) => void;
}

const Filter = ({ name, type, options, onSelect }: FilterProps) => {
  const [selected, setSelected] = useState<string | undefined>(undefined);

  const handleFilterChange = (event: FormEvent<HTMLSelectElement>) => {
    const value = event.currentTarget.value ?? "";
    setSelected(value);
    onSelect(type, value);
  };

  return (
    <>
      <label htmlFor={`${type}-filter`}>{name}:</label>

      <select
        name={`${type}-filter`}
        onChange={handleFilterChange}
        defaultValue={selected}
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

export default HistoryFilter;
