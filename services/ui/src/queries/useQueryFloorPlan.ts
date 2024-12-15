import { Floorplan, PowerPiApi } from "@powerpi/common-api";
import { QueryClient } from "@tanstack/react-query";
import QueryKeyFactory from "./QueryKeyFactory";
import { loader, Query, useQuery } from "./queries";

function floorplanQuery(api: PowerPiApi): Query<Floorplan> {
    return {
        queryKey: QueryKeyFactory.floorplan,
        queryFn: () => api.getFloorplan(),
        staleTime: 5 * 60,
    };
}

export function floorplanLoader(queryClient: QueryClient, api: PowerPiApi) {
    return loader(queryClient, api, floorplanQuery);
}

export default function useQueryFloorplan(enabled = false) {
    function query(api: PowerPiApi) {
        const result = floorplanQuery(api);

        return {
            ...result,
            enabled,
        };
    }

    return useQuery(query);
}
