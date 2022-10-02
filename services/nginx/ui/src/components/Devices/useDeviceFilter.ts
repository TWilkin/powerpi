import { Device } from "@powerpi/api";
import { ChangeEvent, useCallback, useMemo } from "react";
import { ParamKeyValuePair } from "react-router-dom";
import { chain as _ } from "underscore";
import { useFilter } from "../../hooks/Filters";
import { useGetFloorplan } from "../../hooks/floorplan";

export interface Filters {
    // the device types to include
    types: string[];

    // the device locations to include
    locations: string[];

    // the device categories to include
    categories: string[];

    // show only visible devices
    visible: boolean;

    // the search string from the box
    search?: string;
}

export default function useDeviceFilter(devices?: Device[]) {
    const types = useMemo(
        () =>
            _(devices)
                .uniq((device) => device.type)
                .sortBy((device) => device.type)
                .map((device) => ({ key: device.type, value: device.type }))
                .value(),
        [devices]
    );

    // use the floorplan to get the room display names
    const { floorplan } = useGetFloorplan();

    // handle undefined in device location and categories
    const getDeviceLocation = useCallback((device: Device) => device.location ?? "unspecified", []);
    const getDeviceCategories = useCallback(
        (device: Device) => device.categories ?? ["unspecified"],
        []
    );

    const locations = useMemo(
        () =>
            _(devices)
                .uniq((device) => device.location)
                .map((device) => {
                    const location = getDeviceLocation(device);

                    // try and find the room to get the display name
                    for (const floor of floorplan?.floors ?? []) {
                        for (const room of floor.rooms) {
                            if (room.name === location) {
                                return {
                                    key: location,
                                    value: room.display_name ?? location,
                                };
                            }
                        }
                    }

                    return { key: location, value: location };
                })
                .sortBy((filter) => filter.value)
                .value(),
        [devices, floorplan?.floors, getDeviceLocation]
    );

    const categories = useMemo(
        () =>
            _(devices)
                .map((device) => getDeviceCategories(device))
                .flatten()
                .uniq()
                .map((category) => ({ key: category, value: category }))
                .sortBy((filter) => filter.value)
                .value(),
        [devices, getDeviceCategories]
    );

    const naturalDefaults = useMemo(
        () => ({
            types: types.map((type) => type.key),
            locations: locations.map((location) => location.key),
            categories: categories.map((category) => category.key),
            visible: true,
        }),
        [categories, locations, types]
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

            // aply the category filters
            if ((device.categories?.length ?? 0) > 0) {
                result &&= _(getDeviceCategories(device))
                    .any((category) => filters.categories.includes(category))
                    .value();
            }

            return result;
        },
        [getDeviceCategories, getDeviceLocation]
    );

    const { filters, setFilters, filtered, onClear, totalCount, filteredCount } = useFilter(
        "device",
        devices,
        naturalDefaults,
        filter,
        parseQuery,
        toQuery
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

    const onCategoryChange = useCallback(
        (event: ChangeEvent<HTMLInputElement>) => {
            let filterCategories = [...filters.categories];

            if (event.target.checked) {
                filterCategories.push(event.target.value);
            } else {
                filterCategories = filterCategories.filter(
                    (category) => category !== event.target.value
                );
            }

            setFilters((currentFilter) => ({ ...currentFilter, categories: filterCategories }));
        },
        [filters.categories, setFilters]
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
        categories,
        onClear,
        totalCount,
        filteredCount,
        onTypeChange,
        onLocationChange,
        onCategoryChange,
        onVisibleChange,
        onSearchChange,
    };
}

function parseQuery(query: URLSearchParams, defaults: Filters): Filters {
    return {
        types: query.getAll("types") ?? defaults.types,
        locations: query.getAll("locations") ?? defaults.locations,
        categories: query.getAll("categories") ?? defaults.categories,
        visible: query.get("visible") === "1" ?? defaults.visible,
        search: query.get("search") ?? defaults.search,
    };
}

function toQuery(filters: Filters) {
    const params: ParamKeyValuePair[] = [];

    for (const type of filters.types) {
        params.push(["types", type]);
    }

    for (const location of filters.locations) {
        params.push(["locations", location]);
    }

    for (const category of filters.categories) {
        params.push(["categories", category]);
    }

    params.push(["visible", filters.visible ? "1" : "0"]);

    params.push(["search", filters.search ?? ""]);

    return params;
}
