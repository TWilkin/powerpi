import { PowerPiApi } from "@powerpi/common-api";
import { QueryClient, QueryKey, useQuery as useReactQuery } from "@tanstack/react-query";
import useAPI from "./useAPI";

export type Query<TResultType extends object> = {
    queryKey: QueryKey;

    queryFn: () => Promise<TResultType>;
};

type QueryGenerator<TResultType extends object> = (api: PowerPiApi) => Query<TResultType>;

/** Function to use as a loader to pre-populate the query cache with the data.
 * @params queryClient The react-query client instance.
 * @params api The API instance.
 * @params queryGenerator The function to generate the react-query query parameters.
 * @return The loader function which can be used by react-router.
 */
export function loader<TResultType extends object>(
    queryClient: QueryClient,
    api: PowerPiApi,
    queryGenerator: QueryGenerator<TResultType>,
) {
    const query = queryGenerator(api);

    return function loader() {
        return queryClient.ensureQueryData(query);
    };
}

/** Function to retrieve data from the react-query cache, if present.
 * @params queryGenerator The function to generate the react-query query parameters.
 * @return The react-query query results.
 */
export function useQuery<TResultType extends object>(queryGenerator: QueryGenerator<TResultType>) {
    const api = useAPI();

    return useReactQuery(queryGenerator(api));
}
