import { useMemo } from "react";
import useQueryConfig from "../queries/useQueryConfig";
import Route from "./Route";

export default function useOptionalRoute() {
    const { data } = useQueryConfig();

    return useMemo(() => {
        if (!data) {
            return undefined;
        }

        return {
            [Route.Home]: data.hasFloorplan,
            [Route.Device]: data.hasDevices,
            [Route.History]: data.hasPersistence,
        };
    }, [data]);
}
