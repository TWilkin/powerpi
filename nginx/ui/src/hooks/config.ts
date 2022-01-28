import { PowerPiApi } from "@powerpi/api";
import { useQuery } from "react-query";

export function useGetConfig(api: PowerPiApi) {
    const { isLoading, isError, data } = useQuery("config", () => api.getConfig());

    return {
        isConfigLoading: isLoading,
        isConfigError: isError,
        config: data,
    };
}
