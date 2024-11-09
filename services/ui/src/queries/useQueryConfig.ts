import { Config, PowerPiApi } from "@powerpi/common-api";
import { QueryClient } from "@tanstack/react-query";
import { loader, Query, useQuery } from "./queries";
import QueryKeyFactory from "./QueryKeyFactory";

function configQuery(api: PowerPiApi): Query<Config> {
    return {
        queryKey: QueryKeyFactory.config,
        queryFn: async () => {
            try {
                return await api.getConfig();
            } catch (e) {
                // this probably means we're not logged in
                return {
                    hasDevices: false,
                    hasFloorplan: false,
                    hasPersistence: false,
                    hasSensors: false,
                };
            }
        },
        staleTime: Infinity,
    };
}

export function configLoader(queryClient: QueryClient, api: PowerPiApi) {
    return loader(queryClient, api, configQuery);
}

export default function useQueryConfig() {
    return useQuery(configQuery);
}
