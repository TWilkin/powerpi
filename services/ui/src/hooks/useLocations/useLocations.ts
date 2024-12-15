import { useMemo } from "react";
import useQueryFloorplan from "../../queries/useQueryFloorPlan";
import useOptionalRoute from "../../routing/useOptionalRoute";

/** Hook to retrieve the list of locations from the Floorplan. */
export default function useLocations() {
    const enabled = useOptionalRoute();

    const { data } = useQueryFloorplan(enabled?.home);

    const locations = useMemo(() => data?.floors.flatMap((floor) => floor.rooms) ?? [], [data]);

    return locations;
}
