import { Device } from "@powerpi/api";
import { ChangeEvent, useCallback, useLayoutEffect, useMemo, useState } from "react";
import { chain as _ } from "underscore";
import { useGetDevices } from "../../hooks/devices";

export interface Filters {
    types: string[];
}

export default function useDeviceFilter() {
    const { isDevicesLoading, isDevicesError, devices } = useGetDevices();

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

    const defaults = useMemo(
        () => ({
            types,
        }),
        [types]
    );

    const [filters, setFilters] = useState<Filters>(defaults);

    useLayoutEffect(() => setFilters(defaults), [defaults]);

    const onTypeChange = useCallback(
        (event: ChangeEvent<HTMLInputElement>) => {
            let filterTypes = [...filters.types];

            if (event.target.checked) {
                filterTypes.push(event.target.value);
            } else {
                filterTypes = filterTypes.filter((type) => type !== event.target.value);
            }

            setFilters({ types: filterTypes });
        },
        [filters.types]
    );

    const filter = useCallback(
        (device: Device) => device.visible && filters.types.includes(device.type),
        [filters.types]
    );

    const filtered = useMemo(() => devices?.filter(filter), [devices, filter]);

    return {
        filters,
        isDevicesLoading,
        isDevicesError,
        devices: filtered,
        types,
        onTypeChange,
    };
}
