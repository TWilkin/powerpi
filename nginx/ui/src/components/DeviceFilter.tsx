import { faFilter } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { ChangeEvent, useEffect, useState } from "react";

import { Device } from "../api";
import DeviceIcon from "./DeviceIcon";

interface DeviceFilterProps {
  devices: Device[];
  updateFilters: (filters: Filters) => void;
}

export interface Filters {
  types: string[];
}

const DeviceFilter = ({ devices, updateFilters }: DeviceFilterProps) => {
  const [types, setTypes] = useState([] as string[]);
  const [filters, setFilters] = useState({ types: [] } as Filters);

  useEffect(
    () =>
      setTypes([
        ...new Set(
          devices
            .map((device) => device.type)
            .sort((a, b) => (a < b ? -1 : a > b ? 1 : 0))
        )
      ]),
    [devices]
  );

  useEffect(() => setFilters({ types }), [types]);

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
    <div id="device-filters" className="filters">
      <label>
        <FontAwesomeIcon icon={faFilter} />
      </label>

      {types.map((type) => (
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
    </div>
  );
};

export default DeviceFilter;
