import { Device } from "@powerpi/api";
import {
    ChangeEvent,
    MouseEvent,
    useCallback,
    useEffect,
    useLayoutEffect,
    useMemo,
    useState,
} from "react";
import { chain as _ } from "underscore";

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

    const defaults = useMemo(() => {
        // load from local storage
        const saved = localStorage.getItem("deviceFilter");
        const json = saved ? JSON.parse(saved) : undefined;

        // if we have saved data return that, otherwise the natural default
        return json || naturalDefaults;
    }, [naturalDefaults]);

    const [filters, setFilters] = useState<Filters>(defaults);

    useLayoutEffect(() => setFilters(defaults), [defaults]);

    // store the user's filter in local storage
    useEffect(() => localStorage.setItem("deviceFilter", JSON.stringify(filters)), [filters]);

    // reset the filters back to the natural default
    const onClear = useCallback(
        (event: MouseEvent<HTMLElement>) => {
            event.preventDefault();
            setFilters(naturalDefaults);
        },
        [naturalDefaults]
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
        [filters.types]
    );

    const onSearchChange = useCallback(
        (search: string) => setFilters((currentFilter) => ({ ...currentFilter, search })),
        []
    );

    const filter = useCallback(
        (device: Device) => {
            // the search text disables the other filters
            if (filters.search) {
                const search = filters.search.toLocaleLowerCase();

                return (
                    device.display_name?.toLocaleLowerCase().includes(search) ||
                    device.name.toLocaleLowerCase().includes(search)
                );
            }

            return device.visible && filters.types.includes(device.type);
        },
        [filters.search, filters.types]
    );

    const filtered = useMemo(() => devices?.filter(filter), [devices, filter]);

    return {
        filters,
        filtered,
        types,
        onClear,
        onTypeChange,
        onSearchChange,
    };
}
