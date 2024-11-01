import { PowerPiApi } from "@powerpi/common-api";
import { useQuery } from "react-query";
import QueryKeyFactory from "./QueryKeyFactory";
import useAPI from "./useAPI";

function getConfig(api: PowerPiApi) {
    return api.getConfig();
}

export default function useConfig() {
    const api = useAPI();

    return useQuery(QueryKeyFactory.config, () => getConfig(api));
}
