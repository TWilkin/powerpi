import { useMemo } from "react";
import useGenericFilter from "./useGenericFilter";

export default function useFilter<TFilterType, TValueType>(
    filterType: string,
    values: TValueType[] | undefined,
    naturalDefaults: TFilterType,
    filter: (filters: TFilterType, value: TValueType) => boolean
) {
    const { filters, ...otherFilterValues } = useGenericFilter(filterType, naturalDefaults);

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
