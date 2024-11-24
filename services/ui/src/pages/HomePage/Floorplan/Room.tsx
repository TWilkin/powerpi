import { Room as IRoom } from "@powerpi/common-api";
import classNames from "classnames";
import { useMemo } from "react";
import RoomIcons from "./RoomIcons";
import { generateRoomTooltipId } from "./RoomTooltip";
import { isPolygonRoom, isRectangleRoom } from "./ViewBox";

type RoomProps = {
    floor: string;

    room: IRoom;
};

const shapeClasses = classNames(
    "pointer-events-all",
    "fill-none outline-none",
    "stroke-text",
    "hover:fill-bg-hover",
);

/** Component representing a room in the home floorplan. */
const Room = ({ floor, room }: RoomProps) => {
    const points = useMemo(() => {
        if (isPolygonRoom(room)) {
            return room.points.map((point) => `${point.x},${point.y}`).join(" ");
        }

        return undefined;
    }, [room]);

    return (
        <g className="focus:outline-none" data-tooltip-id={generateRoomTooltipId(floor, room.name)}>
            {isRectangleRoom(room) && (
                <rect
                    x={room.x}
                    y={room.y}
                    width={room.width}
                    height={room.height}
                    className={shapeClasses}
                />
            )}

            {points && <polygon points={points} className={shapeClasses} />}

            <RoomIcons room={room} />
        </g>
    );
};
export default Room;
