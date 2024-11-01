import { PowerPiApi } from "@powerpi/common-api";
import { QueryClient, useQuery } from "@tanstack/react-query";
import QueryKeyFactory from "./QueryKeyFactory";
import useAPI from "./useAPI";

function configQuery(api: PowerPiApi) {
    return {
        queryKey: QueryKeyFactory.config,
        queryFn: () => api.getConfig(),
    };
}

export function configLoader(queryClient: QueryClient, api: PowerPiApi) {
    const query = configQuery(api);

    return async function loader() {
        return queryClient.getQueryData(query.queryKey) ?? (await queryClient.fetchQuery(query));
    };
}

export default function useConfig() {
    const api = useAPI();

    return useQuery(configQuery(api));
}
