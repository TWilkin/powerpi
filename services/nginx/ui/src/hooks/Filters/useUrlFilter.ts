import { MouseEvent, useCallback, useEffect, useMemo } from "react";
import { ParamKeyValuePair, useNavigate, useSearchParams } from "react-router-dom";

export function useUrlFilter<TFilterType>(
    filterType: string,
    naturalDefaults: TFilterType,
    parseQuery: (query: URLSearchParams, defaults: TFilterType) => TFilterType,
    toQuery: (filters: TFilterType) => ParamKeyValuePair[],
    jsonConverter?: (obj: { [key in keyof TFilterType]: string }) => TFilterType
) {
    // the storage key is the string we use in local storage to remember the filters
    const storageKey = useMemo(() => `${filterType}Filter`, [filterType]);

    const [query] = useSearchParams();
    const navigate = useNavigate();

    const defaults: TFilterType = useMemo(() => {
        // load from local storage
        const saved = localStorage.getItem(storageKey);
        let json = saved ? JSON.parse(saved) : undefined;

        if (json && Object.keys(json).length > 0) {
            // make sure any conversions happen
            if (jsonConverter) {
                json = jsonConverter(json);
            }

            // ensure the JSON contains any new keys in the natural defaults
            json = { ...naturalDefaults, ...json };

            return json;
        }

        // there was no saved keys so return the natural defaults
        return naturalDefaults;
    }, [jsonConverter, naturalDefaults, storageKey]);

    // get the filters from the URL
    const filters = useMemo(() => parseQuery(query, defaults), [defaults, parseQuery, query]);

    // update the URL
    const setFilters = useCallback(
        (callback: (currentFilter: TFilterType) => TFilterType) => {
            const newFilter = callback(filters);

            const search = new URLSearchParams(toQuery(newFilter)).toString();

            navigate({ pathname: ".", search }, { replace: false });
        },
        [filters, navigate, toQuery]
    );

    // ensure the defaults are initially set
    useEffect(() => {
        if (!window.location.search) {
            setFilters(() => defaults);
        }
    }, [defaults, setFilters]);

    // store the user's filter in local storage
    useEffect(() => {
        if (window.location.search) {
            // only store it when we've retrieved from the URL
            localStorage.setItem(storageKey, JSON.stringify(filters));
        }
    }, [defaults, filters, parseQuery, query, storageKey]);

    // reset the filters back to the natural default
    const onClear = useCallback(
        (event: MouseEvent<HTMLElement>) => {
            event.preventDefault();
            setFilters(() => naturalDefaults);
        },
        [naturalDefaults, setFilters]
    );

    return {
        filters,
        setFilters,
        onClear,
    };
}
