import { Device, PowerPiApi } from "@powerpi/common-api";
import { QueryClient } from "@tanstack/react-query";
import QueryKeyFactory from "./QueryKeyFactory";
import { loader, Query, useQuery } from "./queries";

function deviceQuery(api: PowerPiApi): Query<Device[]> {
    return {
        queryKey: QueryKeyFactory.devices,
        queryFn: () => api.getDevices(),
    };
}

export function devicesLoader(queryClient: QueryClient, api: PowerPiApi) {
    return loader(queryClient, api, deviceQuery);
}

export default function useQueryDevices() {
    return useQuery(deviceQuery);
}
