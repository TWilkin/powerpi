import { History, PaginationResponse, PowerPiApi } from "@powerpi/common-api";
import { QueryClient } from "@tanstack/react-query";
import { infiniteLoader, InfiniteQuery, useInfiniteQuery } from "./queries";
import QueryKeyFactory from "./QueryKeyFactory";

function historyQuery(
    api: PowerPiApi,
): InfiniteQuery<PaginationResponse<History>, Date | undefined> {
    return {
        queryKey: QueryKeyFactory.history,
        initialPageParam: undefined,

        queryFn: ({ pageParam }) =>
            api.getHistory(undefined, undefined, undefined, undefined, pageParam, 10),

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

export function historyLoader(queryClient: QueryClient, api: PowerPiApi) {
    return infiniteLoader(queryClient, api, historyQuery);
}

export default function useInfiniteQueryHistory() {
    return useInfiniteQuery(historyQuery);
}
