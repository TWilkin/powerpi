import { ChangeEvent } from "react";
import DeviceIcon from "../Components/DeviceIcon";
import FilterGroup from "../Components/FilterGroup";
import ListFilter from "../Components/ListFilter";
import { Filters } from "./useDeviceFilter";

interface DeviceFilterProps {
    filters: Filters;
    types: string[];
    locations: string[];
    onTypeChange: (event: ChangeEvent<HTMLInputElement>) => void;
    onLocationChange: (event: ChangeEvent<HTMLInputElement>) => void;
    onVisibleChange: () => void;
}

const DeviceFilter = ({
    filters,
    types,
    locations,
    onTypeChange,
    onLocationChange,
    onVisibleChange,
}: DeviceFilterProps) => {
    return (
        <div>
            <ListFilter
                values={types}
                filters={filters.types}
                onChange={onTypeChange}
                element={(type) => (
                    <>
                        <DeviceIcon type={type} />
                        <div>{type}</div>
                    </>
                )}
            />

            <ListFilter
                values={locations}
                filters={filters.locations}
                onChange={onLocationChange}
                element={(location) => <>{location}</>}
            />

            <FilterGroup>
                <label>
                    <input type="checkbox" checked={filters.visible} onChange={onVisibleChange} />
                    only show visible devices
                </label>
            </FilterGroup>
        </div>
    );
};
export default DeviceFilter;
