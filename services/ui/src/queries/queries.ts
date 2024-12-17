import { PowerPiApi } from "@powerpi/common-api";
import {
    QueryClient,
    QueryKey,
    useSuspenseQuery,
    UseSuspenseQueryOptions,
} from "@tanstack/react-query";
import { defer } from "react-router-dom";
import useAPI from "./useAPI";

export type Query<TResultType> = UseSuspenseQueryOptions<TResultType, Error, TResultType, QueryKey>;

type QueryGenerator<TResultType> = (api: PowerPiApi) => Query<TResultType>;

/** Function to use as a loader to pre-populate the query cache with the data.
 * @params queryClient The react-query client instance.
 * @params api The API instance.
 * @params queryGenerator The function to generate the react-query query parameters.
 * @return The loader function which can be used by react-router.
 */
export function loader<TResultType>(
    queryClient: QueryClient,
    api: PowerPiApi,
    queryGenerator: QueryGenerator<TResultType>,
) {
    const query = queryGenerator(api);

    return function loader() {
        return defer({ data: queryClient.ensureQueryData(query) });
    };
}

/** Function to retrieve data from the react-query cache, if present.
 * @params queryGenerator The function to generate the react-query query parameters.
 * @return The react-query query results.
 */
export function useQuery<TResultType>(queryGenerator: QueryGenerator<TResultType>) {
    const api = useAPI();

    return useSuspenseQuery(queryGenerator(api));
}
