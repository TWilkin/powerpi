import { History, PaginationResponse, PowerPiApi } from "@powerpi/common-api";
import { QueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { infiniteLoader, InfiniteQuery, useInfiniteQuery } from "./queries";
import QueryKeyFactory from "./QueryKeyFactory";

function historyQuery(
    api: PowerPiApi,
    type: string | undefined,
    entity: string | undefined,
    action: string | undefined,
): InfiniteQuery<PaginationResponse<History>, Date | undefined> {
    return {
        queryKey: QueryKeyFactory.history(type, entity, action),
        initialPageParam: undefined,

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
    return infiniteLoader(queryClient, api, () => historyQuery(api, undefined, entity, undefined));
}

export default function useInfiniteQueryHistory(
    type: string | undefined,
    entity: string | undefined,
    action: string | undefined,
) {
    const query = useCallback(
        (api: PowerPiApi) => historyQuery(api, type, entity, action),
        [action, entity, type],
    );

    return useInfiniteQuery(query);
}
