import { useQuery } from "react-query";
import useAPI from "./api";
import QueryKeyFactory from "./QueryKeyFactory";

export function useGetFloorplan() {
    const api = useAPI();
    const { isLoading, isError, data } = useQuery(QueryKeyFactory.floorplan(), () =>
        api.getFloorplan()
    );

    return {
        isFloorplanLoading: isLoading,
        isFloorplanError: isError,
        floorplan: data,
    };
}
