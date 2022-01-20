import { PowerPiApi } from "@powerpi/api";
import { useQuery } from "react-query";

export default function useGetSensors(api: PowerPiApi) {
    const { isLoading, isError, data } = useQuery("sensors", () => api.getSensors());

    return {
        isSensorsLoading: isLoading,
        isSensorsError: isError,
        sensors: data,
    };
}
