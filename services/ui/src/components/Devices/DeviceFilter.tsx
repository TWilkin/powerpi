import { faFilterCircleXmark } from "@fortawesome/free-solid-svg-icons";
import { ChangeEventHandler, MouseEventHandler } from "react";
import Button from "../Components/Button";
import DeviceIcon from "../Components/DeviceIcon";
import FilterGroup from "../Components/FilterGroup";
import ListFilter, { IListFilter } from "../Components/ListFilter";
import { Filters } from "./useDeviceFilter";

interface DeviceFilterProps {
    filters: Filters;
    types: IListFilter[];
    locations: IListFilter[];
    categories: IListFilter[];
    onTypeChange: ChangeEventHandler<HTMLInputElement>;
    onLocationChange: ChangeEventHandler<HTMLInputElement>;
    onCategoryChange: ChangeEventHandler<HTMLInputElement>;
    onVisibleChange: () => void;
    onClear: MouseEventHandler<HTMLButtonElement>;
}

const DeviceFilter = ({
    filters,
    types,
    locations,
    categories,
    onTypeChange,
    onLocationChange,
    onCategoryChange,
    onVisibleChange,
    onClear,
}: DeviceFilterProps) => {
    return (
        <div>
            <ListFilter
                title="Device Types"
                values={types}
                filters={filters.types}
                onChange={onTypeChange}
                element={(type) => (
                    <>
                        <DeviceIcon type={type.key} />
                        <div>{type.value}</div>
                    </>
                )}
            />

            <ListFilter
                title="Locations"
                values={locations}
                filters={filters.locations}
                onChange={onLocationChange}
                element={(location) => <>{location.value}</>}
            />

            <ListFilter
                title="Categories"
                values={categories}
                filters={filters.categories}
                onChange={onCategoryChange}
                element={(category) => <>{category.value}</>}
            />

            <FilterGroup>
                <label>
                    <input type="checkbox" checked={filters.visible} onChange={onVisibleChange} />
                    only show visible devices
                </label>
            </FilterGroup>

            <Button text="Clear" icon={faFilterCircleXmark} onClick={onClear} />
        </div>
    );
};
export default DeviceFilter;
