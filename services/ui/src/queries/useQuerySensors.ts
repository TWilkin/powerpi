import { PowerPiApi, Sensor } from "@powerpi/common-api";
import { QueryClient } from "@tanstack/react-query";
import QueryKeyFactory from "./QueryKeyFactory";
import { loader, Query, useQuery } from "./queries";

function sensorQuery(api: PowerPiApi): Query<Sensor[]> {
    return {
        queryKey: QueryKeyFactory.sensors,
        queryFn: () => api.getSensors(),
    };
}

export function sensorsLoader(queryClient: QueryClient, api: PowerPiApi) {
    return loader(queryClient, api, sensorQuery);
}

export default function useQuerySensors() {
    return useQuery(sensorQuery);
}
