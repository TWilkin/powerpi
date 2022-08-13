import { Device } from "@powerpi/api";
import { ChangeEvent, useCallback, useMemo } from "react";
import { chain as _ } from "underscore";
import useFilter from "../../hooks/useFilter";

export interface Filters {
    // the device types to include
    types: string[];

    // the device locations to include
    locations: string[];

    // show only visible devices
    visible: boolean;

    // the search string from the box
    search?: string;
}

export default function useDeviceFilter(devices?: Device[]) {
    const types = useMemo(
        () => [
            ...new Set(
                _(devices)
                    .sortBy((device) => device.type)
                    .map((device) => device.type)
                    .value()
            ),
        ],
        [devices]
    );

    // handle undefined in device location
    const getDeviceLocation = useCallback((device: Device) => device.location ?? "unspecified", []);

    const locations = useMemo(
        () => [...new Set(_(devices).sortBy(getDeviceLocation).map(getDeviceLocation).value())],
        [devices, getDeviceLocation]
    );

    const naturalDefaults = useMemo(
        () => ({ types, locations, visible: true }),
        [locations, types]
    );

    // apply the filtering criteria
    const filter = useCallback(
        (filters: Filters, device: Device) => {
            // the search text disables the other filters
            if (filters.search) {
                const search = filters.search.toLocaleLowerCase();

                return (
                    device.display_name?.toLocaleLowerCase().includes(search) ||
                    device.name.toLocaleLowerCase().includes(search)
                );
            }

            let result = true;

            // apply the visible filter
            if (filters.visible) {
                result &&= device.visible;
            } else {
                result &&= !device.visible;
            }

            // apply the type filters
            result &&= filters.types.includes(device.type);

            // apply the location filters
            result &&= filters.locations.includes(getDeviceLocation(device));

            return result;
        },
        [getDeviceLocation]
    );

    const { filters, setFilters, filtered, onClear, totalCount, filteredCount } = useFilter(
        "device",
        devices,
        naturalDefaults,
        filter
    );

    const onTypeChange = useCallback(
        (event: ChangeEvent<HTMLInputElement>) => {
            let filterTypes = [...filters.types];

            if (event.target.checked) {
                filterTypes.push(event.target.value);
            } else {
                filterTypes = filterTypes.filter((type) => type !== event.target.value);
            }

            setFilters((currentFilter) => ({ ...currentFilter, types: filterTypes }));
        },
        [filters.types, setFilters]
    );

    const onLocationChange = useCallback(
        (event: ChangeEvent<HTMLInputElement>) => {
            let filterLocations = [...filters.locations];

            if (event.target.checked) {
                filterLocations.push(event.target.value);
            } else {
                filterLocations = filterLocations.filter(
                    (location) => location !== event.target.value
                );
            }

            setFilters((currentFilter) => ({ ...currentFilter, locations: filterLocations }));
        },
        [filters.locations, setFilters]
    );

    const onVisibleChange = useCallback(
        () =>
            setFilters((currentFilter) => ({ ...currentFilter, visible: !currentFilter.visible })),
        [setFilters]
    );

    const onSearchChange = useCallback(
        (search: string) => setFilters((currentFilter) => ({ ...currentFilter, search })),
        [setFilters]
    );

    return {
        filters,
        filtered,
        types,
        locations,
        onClear,
        totalCount,
        filteredCount,
        onTypeChange,
        onLocationChange,
        onVisibleChange,
        onSearchChange,
    };
}
