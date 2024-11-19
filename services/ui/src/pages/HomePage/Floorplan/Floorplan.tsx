import { Floorplan as IFloorplan } from "@powerpi/common-api";
import { useMemo } from "react";
import useFloor from "../useFloor";
import Floor from "./Floor";
import useRotateFloorplan from "./useRotateFloorplan";

type FloorplanProps = {
    floorplan: IFloorplan;
};

/** Component representing the SVG of the home floorplan. */
const Floorplan = ({ floorplan }: FloorplanProps) => {
    const currentFloorName = useFloor();

    const { floorplan: effectiveFloorplan, viewBox: effectiveViewBox } = useRotateFloorplan(
        floorplan,
        false,
    );

    const currentFloor = useMemo(
        () => effectiveFloorplan.floors.find((floor) => floor.name === currentFloorName),
        [currentFloorName, effectiveFloorplan.floors],
    );

    return (
        <>
            {currentFloor && (
                <svg
                    viewBox={`${effectiveViewBox.minX} ${effectiveViewBox.minY} ${effectiveViewBox.maxX} ${effectiveViewBox.maxY}`}
                    preserveAspectRatio="xMidYMid"
                    className="flex-1"
                >
                    <Floor floor={currentFloor} />
                </svg>
            )}
        </>
    );
};
export default Floorplan;
