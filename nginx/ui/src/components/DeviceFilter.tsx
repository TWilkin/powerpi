import React, { ChangeEvent, useEffect, useState } from "react";
import { Device } from "powerpi-common-api";

import DeviceIcon from "./DeviceIcon";
import Loading from "./Loading";

interface DeviceFilterProps {
  devices?: Device[];
  updateFilters: (filters: Filters) => void;
}

export interface Filters {
  types: string[];
}

const DeviceFilter = ({ devices, updateFilters }: DeviceFilterProps) => {
  const [types, setTypes] = useState<string[] | undefined>(undefined);
  const [filters, setFilters] = useState<Filters>({ types: [] });

  useEffect(
    () =>
      setTypes([
        ...new Set(
          devices
            ?.map((device) => device.type)
            .sort((a, b) => (a < b ? -1 : a > b ? 1 : 0))
        )
      ]),
    [devices]
  );

  useEffect(() => setFilters({ types: types ?? [] }), [types]);

  useEffect(() => updateFilters(filters), [filters]);

  const handleTypeFilterChange = (event: ChangeEvent<HTMLInputElement>) => {
    let filterTypes = [...filters.types];

    if (event.target.checked) {
      filterTypes.push(event.target.value);
    } else {
      filterTypes = filterTypes.filter((type) => type !== event.target.value);
    }

    setFilters({ types: filterTypes });
  };

  return (
    <div id="device-filters">
      <Loading loading={!types}>
        {types?.map((type) => (
          <label key={type}>
            <input
              type="checkbox"
              name="device-type"
              value={type}
              checked={filters.types.includes(type)}
              onChange={handleTypeFilterChange}
            />
            <DeviceIcon type={type} />
            <div className="device-type">{type}</div>
          </label>
        ))}
      </Loading>
    </div>
  );
};

export default DeviceFilter;
