import { ConfigStatusMessage } from "@powerpi/common-api";
import { ConfigFileType } from "@powerpi/common-api/dist/src/ConfigStatus";
import { useEffect } from "react";
import { useQuery, useQueryClient } from "react-query";
import QueryKeyFactory from "./QueryKeyFactory";
import useAPI from "./api";

export function useGetFloorplan() {
    const api = useAPI();
    const { isLoading, isError, data } = useQuery(QueryKeyFactory.floorplan(), () =>
        api.getFloorplan(),
    );

    const queryClient = useQueryClient();

    // handle socket.io updates
    useEffect(() => {
        const onConfigChange = async (message: ConfigStatusMessage) => {
            if (message.type === ConfigFileType.Floorplan) {
                await queryClient.invalidateQueries(QueryKeyFactory.floorplan());
            }
        };

        api.addConfigChangeListener(onConfigChange);

        return () => api.removeConfigChangeListener(onConfigChange);
    }, [api, queryClient]);

    return {
        isFloorplanLoading: isLoading,
        isFloorplanError: isError,
        floorplan: data,
    };
}
