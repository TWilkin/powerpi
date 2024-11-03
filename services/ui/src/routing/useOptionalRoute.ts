import { useMemo } from "react";
import useConfig from "../queries/useConfig";
import Route from "./Route";

export default function useOptionalRoute() {
    const { data } = useConfig();

    return useMemo(() => {
        if (!data) {
            return undefined;
        }

        return {
            [Route.Home]: data.hasFloorplan,
        };
    }, [data]);
}
