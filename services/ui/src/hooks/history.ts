import { History, PaginationResponse } from "@powerpi/common-api";
import { useCallback, useEffect } from "react";
import { UseQueryResult, useInfiniteQuery, useQuery, useQueryClient } from "react-query";
import { chain as _ } from "underscore";
import { HistoryQueryKeyFactory } from "./QueryKeyFactory";
import useAPI from "./api";

export function useGetHistoryFilters(type?: string) {
    const api = useAPI();
    const actions = useGetHistoryFilter(
        HistoryQueryKeyFactory.actions(),
        api.getHistoryActions,
        type,
    );
    const entities = useGetHistoryFilter(
        HistoryQueryKeyFactory.entities(),
        api.getHistoryEntities,
        type,
    );
    const types = useGetHistoryFilter(HistoryQueryKeyFactory.types(), (_) => api.getHistoryTypes());

    return {
        actions: extractResult(actions, "action"),
        entities: extractResult(entities, "entity"),
        types: extractResult(types, "type"),
    };
}

function useGetHistoryFilter<TFilter>(
    key: string[],
    method: (type?: string) => Promise<TFilter[]>,
    type?: string,
) {
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

export function useInvalidateHistory() {
    const queryClient = useQueryClient();

    return useCallback(
        async () => await queryClient.invalidateQueries(HistoryQueryKeyFactory.base()),
        [queryClient],
    );
}

export function useGetHistory(
    records: number,
    start?: Date,
    end?: Date,
    type?: string,
    entity?: string,
    action?: string,
) {
    const api = useAPI();

    const nextPage = useCallback(
        ({ pageParam = end }: { pageParam?: Date | boolean }) => {
            if (pageParam !== false) {
                // only make the request if we have data
                return api.getHistory(type, entity, action, start, pageParam as Date, records);
            }

            return undefined;
        },
        [action, api, end, entity, records, start, type],
    );

    const getNextPageParam = useCallback(
        (
            lastPage: PaginationResponse<History> | undefined,
            allPages: (PaginationResponse<History> | undefined)[],
        ) => {
            const previousTimestamp = _(allPages.at(-2)?.data)
                .last()
                .value()?.timestamp;
            const lastTimestamp = _(lastPage?.data)
                .last()
                .value()?.timestamp;

            if (!lastTimestamp || !previousTimestamp || lastTimestamp < previousTimestamp) {
                // we still have some pages so return the date to query to
                return lastTimestamp;
            }

            return false;
        },
        [],
    );

    const { isLoading, isError, fetchNextPage, hasNextPage, isFetching, isFetchingNextPage, data } =
        useInfiniteQuery(HistoryQueryKeyFactory.page(type, entity, action, start, end), nextPage, {
            getNextPageParam,
        });

    return {
        isHistoryLoading: isLoading,
        isHistoryError: isError,
        history: data,
        historyFetchNextPage: fetchNextPage,
        hasHistoryNextPage: hasNextPage,
        isHistoryFetching: isFetching,
        isHistoryFetchingNextPage: isFetchingNextPage,
    };
}

export function useGetHistoryRange(
    start?: Date,
    end?: Date,
    type?: string,
    entity?: string,
    action?: string,
) {
    const api = useAPI();
    const { isLoading, isError, data } = useQuery(
        ["history/range", start, end, type, entity, action],
        () => api.getHistoryRange(start, end, type, entity, action),
    );

    return {
        isHistoryLoading: isLoading,
        isHistoryError: isError,
        history: data,
    };
}

export function useSocketIORefreshHistory() {
    const api = useAPI();

    const invalidateHistory = useInvalidateHistory();

    // handle socket.io updates
    useEffect(() => {
        const refresh = async () => await invalidateHistory();

        api.addDeviceListener(refresh);
        api.addSensorListener(refresh);
        api.addBatteryListener(refresh);
        api.addCapabilityListener(refresh);

        return () => {
            api.removeDeviceListener(refresh);
            api.removeSensorListener(refresh);
            api.removeBatteryListener(refresh);
            api.removeCapabilityListener(refresh);
        };
    }, [api, invalidateHistory]);
}
