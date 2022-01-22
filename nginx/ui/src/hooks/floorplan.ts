import { PowerPiApi } from "@powerpi/api";
import { useQuery } from "react-query";

export function useGetFloorplan(api: PowerPiApi) {
    const { isLoading, isError, data } = useQuery("floorplan", () => api.getFloorplan());

    return {
        isFloorplanLoading: isLoading,
        isFloorplanError: isError,
        floorplan: data,
    };
}
