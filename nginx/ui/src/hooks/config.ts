import { useQuery } from "react-query";
import useAPI from "./api";

export function useGetConfig() {
    const api = useAPI();
    const { isLoading, isError, data } = useQuery("config", () => api.getConfig());

    return {
        isConfigLoading: isLoading,
        isConfigError: isError,
        config: data,
    };
}
