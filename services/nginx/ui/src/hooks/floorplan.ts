import { useQuery } from "react-query";
import useAPI from "./api";

export function useGetFloorplan() {
    const api = useAPI();
    const { isLoading, isError, data } = useQuery("floorplan", () => api.getFloorplan());

    return {
        isFloorplanLoading: isLoading,
        isFloorplanError: isError,
        floorplan: data,
    };
}
