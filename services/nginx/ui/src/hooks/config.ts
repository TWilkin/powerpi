import { useQuery } from "react-query";
import useAPI from "./api";
import QueryKeyFactory from "./QueryKeyFactory";

export function useGetConfig() {
    const api = useAPI();
    const { isLoading, isError, data } = useQuery(QueryKeyFactory.config(), () => api.getConfig());

    return {
        isConfigLoading: isLoading,
        isConfigError: isError,
        config: data,
    };
}
