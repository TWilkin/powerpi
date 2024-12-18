import { History, PaginationResponse, PowerPiApi } from "@powerpi/common-api";
import { QueryClient, useSuspenseInfiniteQuery } from "@tanstack/react-query";
import { infiniteLoader } from "./queries";
import QueryKeyFactory from "./QueryKeyFactory";
import useAPI from "./useAPI";

function historyQuery(api: PowerPiApi) {
    return {
        queryKey: QueryKeyFactory.history,
        initialPageParam: new Date(),

        queryFn: ({ pageParam = undefined }: { pageParam: Date | undefined }) =>
            api.getHistory(undefined, undefined, undefined, pageParam, undefined, 10),

        getNextPageParam(lastPage: PaginationResponse<History>) {
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
    // TODO work out why the hook is messing with the return type
    const api = useAPI();

    return useSuspenseInfiniteQuery(historyQuery(api));
}
