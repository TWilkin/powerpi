import { useMemo } from "react";
import { useParams } from "react-router-dom";

/** Hook to retrieve the current floor from the URL. */
export default function useFloor() {
    const { floor } = useParams();

    return useMemo(() => (floor ? decodeURI(floor) : ""), [floor]);
}
