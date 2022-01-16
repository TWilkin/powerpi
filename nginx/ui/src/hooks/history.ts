import { PowerPiApi } from "@powerpi/api";
import { useQuery, UseQueryResult } from "react-query";

export function useGetHistoryFilters(api: PowerPiApi, type?: string) {
    const actions = useGetHistoryFilter("actions", api.getHistoryActions, type);
    const entities = useGetHistoryFilter("entities", api.getHistoryEntities, type);
    const types = useGetHistoryFilter("types", (_) => api.getHistoryTypes());

    return {
        actions: extractResult(actions, "action"),
        entities: extractResult(entities, "entity"),
        types: extractResult(types, "type"),
    };
}

function useGetHistoryFilter<TFilter>(
    name: string,
    method: (type?: string) => Promise<TFilter[]>,
    type?: string
) {
    const key = ["history", name];
    if (type) {
        key.push(type);
    }

    return useQuery(key, () => method(type));
}

function extractResult<TRecord>(result: UseQueryResult<TRecord[], unknown>, prop: keyof TRecord) {
    return {
        isLoading: result.isLoading,
        isError: result.isError,
        data:
            result.data && result.data.length > 0 ? result.data.map((record) => record[prop]) : [],
    };
}

export function useGetHistory(
    api: PowerPiApi,
    page: number,
    records: number,
    type?: string,
    entity?: string,
    action?: string
) {
    const { isLoading, isError, data } = useQuery(
        ["history", type, entity, action, page, records],
        () => api.getHistory(type, entity, action, page, records),
        {
            keepPreviousData: true,
        }
    );

    return {
        isHistoryLoading: isLoading,
        isHistoryError: isError,
        history: data,
    };
}

export function useGetHistoryRange(
    api: PowerPiApi,
    start?: Date,
    end?: Date,
    type?: string,
    entity?: string,
    action?: string
) {
    const { isLoading, isError, data } = useQuery(
        ["history/range", start, end, type, entity, action],
        () => api.getHistoryRange(start, end, type, entity, action)
    );

    return {
        isHistoryLoading: isLoading,
        isHistoryError: isError,
        history: data,
    };
}
