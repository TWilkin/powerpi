import { ChangeEvent } from "react";
import DeviceIcon from "../Components/DeviceIcon";
import FilterGroup from "../Components/FilterGroup";
import Loading from "../Components/Loading";
import styles from "./DeviceFilter.module.scss";
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
        <div className={styles.filters}>
            <FilterGroup>
                <Loading loading={!types}>
                    {types?.map((type) => (
                        <label key={type}>
                            <input
                                type="checkbox"
                                value={type}
                                checked={filters.types.includes(type)}
                                onChange={onTypeChange}
                            />
                            <DeviceIcon type={type} />
                            <div>{type}</div>
                        </label>
                    ))}
                </Loading>
            </FilterGroup>

            <FilterGroup>
                <Loading loading={!locations}>
                    {locations?.map((location) => (
                        <label key={location}>
                            <input
                                type="checkbox"
                                value={location}
                                checked={filters.locations.includes(location)}
                                onChange={onLocationChange}
                            />
                            {location}
                        </label>
                    ))}
                </Loading>
            </FilterGroup>

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
