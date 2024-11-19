import { Floorplan as IFloorplan } from "@powerpi/common-api";
import { useMemo } from "react";
import useFloor from "../useFloor";
import Floor from "./Floor";

type FloorplanProps = {
    floorplan: IFloorplan;
};

/** Component representing the SVG of the home floorplan. */
const Floorplan = ({ floorplan }: FloorplanProps) => {
    const currentFloorName = useFloor();

    const currentFloor = useMemo(
        () => floorplan.floors.find((floor) => floor.name === currentFloorName),
        [currentFloorName, floorplan.floors],
    );

    return (
        <>
            {currentFloor && (
                <svg preserveAspectRatio="xMidYMid" className="flex-1">
                    <Floor floor={currentFloor} />
                </svg>
            )}
        </>
    );
};
export default Floorplan;
