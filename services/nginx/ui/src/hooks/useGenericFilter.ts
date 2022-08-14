import { MouseEvent, useCallback, useEffect, useLayoutEffect, useMemo, useState } from "react";

export default function useGenericFilter<TFilterType>(
    filterType: string,
    naturalDefaults: TFilterType
) {
    // the storage key is the string we use in local storage to remember the filters
    const storageKey = useMemo(() => `${filterType}Filter`, [filterType]);

    const defaults = useMemo(() => {
        // load from local storage
        const saved = localStorage.getItem(storageKey);
        let json = saved ? JSON.parse(saved) : undefined;

        // ensure the JSON contains any new keys in the natural defaults
        if (json && Object.keys(json).length > 0) {
            json = { ...naturalDefaults, ...json };
            return json;
        }

        // there was no saved keys so return the natural defaults
        return naturalDefaults;
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

    return {
        filters,
        setFilters,
        onClear,
    };
}
