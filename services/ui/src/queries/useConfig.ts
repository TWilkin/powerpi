import { PowerPiApi } from "@powerpi/common-api";
import { useQuery } from "react-query";
import { queryClient } from "./client";
import QueryKeyFactory from "./QueryKeyFactory";
import useAPI from "./useAPI";

function getConfig(api: PowerPiApi) {
    return api.getConfig();
}

export function configLoader(api: PowerPiApi) {
    return queryClient.fetchQuery(QueryKeyFactory.config, () => getConfig(api));
}

export default function useConfig() {
    const api = useAPI();

    return useQuery(QueryKeyFactory.config, () => getConfig(api));
}
