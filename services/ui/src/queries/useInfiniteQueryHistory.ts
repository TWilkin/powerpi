import { History, PaginationResponse, PowerPiApi } from "@powerpi/common-api";
import { QueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { infiniteLoader, InfiniteQuery, useInfiniteQuery } from "./queries";
import QueryKeyFactory from "./QueryKeyFactory";

function historyQuery(
    api: PowerPiApi,
    start: Date | undefined,
    type: string | undefined,
    entity: string | undefined,
    action: string | undefined,
): InfiniteQuery<PaginationResponse<History>, Date | undefined> {
    return {
        queryKey: QueryKeyFactory.history(start, type, entity, action),
        initialPageParam: start,

        queryFn: ({ pageParam }) => api.getHistory(type, entity, action, undefined, pageParam, 50),

        getNextPageParam(lastPage) {
            // first we need to get all the timestamps
            const timestamps = lastPage.data
                ?.map((record) => record.timestamp)
                .filter((timestamp): timestamp is string => timestamp != null)
                .map((timestamp) => new Date(timestamp).getTime());

            // if we have some timestamps, we need the oldest
            if (timestamps && timestamps.length > 0) {
                const minimumDate = Math.min(...timestamps);

                return new Date(minimumDate);
            }

            return new Date();
        },
    };
}

export function historyLoader(
    queryClient: QueryClient,
    api: PowerPiApi,
    entity: string | undefined,
) {
    return infiniteLoader(queryClient, api, () =>
        historyQuery(api, undefined, undefined, entity, undefined),
    );
}

export default function useInfiniteQueryHistory(
    start: Date | undefined,
    type: string | undefined,
    entity: string | undefined,
    action: string | undefined,
) {
    const query = useCallback(
        (api: PowerPiApi) => historyQuery(api, start, type, entity, action),
        [action, entity, start, type],
    );

    return useInfiniteQuery(query);
}
