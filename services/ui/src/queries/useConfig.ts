import { Config, PowerPiApi } from "@powerpi/common-api";
import { QueryClient } from "@tanstack/react-query";
import { loader, Query, useQuery } from "./queries";
import QueryKeyFactory from "./QueryKeyFactory";

function configQuery(api: PowerPiApi): Query<Config> {
    return {
        queryKey: QueryKeyFactory.config,
        queryFn: () => api.getConfig(),
    };
}

export function configLoader(queryClient: QueryClient, api: PowerPiApi) {
    return loader(queryClient, api, configQuery);
}

export default function useConfig() {
    return useQuery(configQuery);
}
