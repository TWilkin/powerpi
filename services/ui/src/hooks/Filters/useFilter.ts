import { useMemo } from "react";
import { ParamKeyValuePair } from "react-router-dom";
import { useUrlFilter } from "./useUrlFilter";

export function useFilter<TFilterType, TValueType>(
    filterType: string,
    values: TValueType[] | undefined,
    naturalDefaults: TFilterType,
    filter: (filters: TFilterType, value: TValueType) => boolean,
    parseQuery: (query: URLSearchParams, defaults: TFilterType) => TFilterType,
    toQuery: (filters: TFilterType) => ParamKeyValuePair[]
) {
    const { filters, ...otherFilterValues } = useUrlFilter(
        filterType,
        naturalDefaults,
        parseQuery,
        toQuery
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
        ...otherFilterValues,
        filters,
        filtered,
        totalCount,
        filteredCount,
    };
}
