import { MouseEvent, useCallback, useEffect, useLayoutEffect, useMemo, useState } from "react";

export default function useFilter<TFilterType, TValueType>(
    filterType: string,
    values: TValueType[] | undefined,
    naturalDefaults: TFilterType,
    filter: (filters: TFilterType, value: TValueType) => boolean
) {
    // the storage key is the string we use in local storage to remember the filters
    const storageKey = useMemo(() => `${filterType}Filter`, [filterType]);

    const defaults = useMemo(() => {
        // load from local storage
        const saved = localStorage.getItem(storageKey);
        const json = saved ? JSON.parse(saved) : undefined;

        // if we have saved data return that, otherwise the natural default
        return json || naturalDefaults;
    }, [naturalDefaults, storageKey]);

    // the actual filter
    const [filters, setFilters] = useState<TFilterType>(defaults);

    // ensure the defaults are set initially, if the natural defaults change (i.e. loaded from API)
    useLayoutEffect(() => setFilters(defaults), [defaults]);

    // store the user's filter in local storage
    useEffect(
        () => localStorage.setItem(storageKey, JSON.stringify(filters)),
        [filters, storageKey]
    );

    // reset the filters back to the natural default
    const onClear = useCallback(
        (event: MouseEvent<HTMLElement>) => {
            event.preventDefault();
            setFilters(naturalDefaults);
        },
        [naturalDefaults]
    );

    // apply the filtering
    const filtered = useMemo(
        () => values?.filter((value) => filter(filters, value)),
        [filter, filters, values]
    );

    // get the counts
    const [totalCount, filteredCount] = useMemo(() => {
        const totalCount = values?.length ?? 0;
        const filteredCount = totalCount - (filtered?.length ?? 0);

        return [totalCount, filteredCount];
    }, [filtered?.length, values?.length]);

    return {
        filters,
        setFilters,
        filtered,
        onClear,
        totalCount,
        filteredCount,
    };
}
