import { Floorplan as IFloorplan } from "@powerpi/common-api";
import { useMemo } from "react";
import useOrientation from "../../../hooks/useOrientation";
import useFloor from "../useFloor";
import Floor from "./Floor";
import useRotateFloorplan from "./useRotateFloorplan";
import { viewBoxByFloorplan } from "./ViewBox";

type FloorplanProps = {
    floorplan: IFloorplan;
};

/** Component representing the SVG of the home floorplan. */
const Floorplan = ({ floorplan }: FloorplanProps) => {
    const currentFloorName = useFloor();

    const { isLandscape, isPortrait } = useOrientation();

    const rotate = useMemo(() => {
        const size = viewBoxByFloorplan(floorplan);

        // the floorplan is wider than it is tall
        const wide = size.maxX >= size.maxY;

        return (wide && isPortrait) || (!wide && isLandscape);
    }, [floorplan, isLandscape, isPortrait]);

    const { floorplan: effectiveFloorplan, viewBox: effectiveViewBox } = useRotateFloorplan(
        floorplan,
        rotate,
    );

    const currentFloor = useMemo(
        () => effectiveFloorplan.floors.find((floor) => floor.name === currentFloorName),
        [currentFloorName, effectiveFloorplan.floors],
    );

    return (
        <div className="relative flex-1">
            {currentFloor && (
                <svg
                    viewBox={`${effectiveViewBox.minX} ${effectiveViewBox.minY} ${effectiveViewBox.maxX} ${effectiveViewBox.maxY}`}
                    preserveAspectRatio="xMidYMid"
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[95%] h-[95%]"
                >
                    <Floor floor={currentFloor} />
                </svg>
            )}
        </div>
    );
};
export default Floorplan;
