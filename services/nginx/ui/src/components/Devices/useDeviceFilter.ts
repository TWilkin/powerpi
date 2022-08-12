import { Device } from "@powerpi/api";
import { ChangeEvent, useCallback, useMemo } from "react";
import { chain as _ } from "underscore";
import useFilter from "../../hooks/useFilter";

export interface Filters {
    types: string[];
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

    const naturalDefaults = useMemo(() => ({ types }), [types]);

    const filter = useCallback((filters: Filters, device: Device) => {
        // the search text disables the other filters
        if (filters.search) {
            const search = filters.search.toLocaleLowerCase();

            return (
                device.display_name?.toLocaleLowerCase().includes(search) ||
                device.name.toLocaleLowerCase().includes(search)
            );
        }

        return device.visible && filters.types.includes(device.type);
    }, []);

    const { filters, setFilters, filtered, onClear } = useFilter(
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

    const onSearchChange = useCallback(
        (search: string) => setFilters((currentFilter) => ({ ...currentFilter, search })),
        [setFilters]
    );

    return {
        filters,
        filtered,
        types,
        onClear,
        onTypeChange,
        onSearchChange,
    };
}
