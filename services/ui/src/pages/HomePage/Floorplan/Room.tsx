import { Room as IRoom } from "@powerpi/common-api";
import { useMemo } from "react";
import { isPolygon, isRect } from "./ViewBox";

type RoomProps = {
    room: IRoom;
};

const shapeClasses = "fill-none stroke-black dark:stroke-white outline-none";

/** Component representing a room in the home floorplan. */
const Room = ({ room }: RoomProps) => {
    const points = useMemo(() => {
        if (isPolygon(room)) {
            return room.points?.map((point) => `${point.x},${point.y}`).join(" ");
        }

        return undefined;
    }, [room]);

    return (
        <g>
            {isRect(room) && (
                <rect
                    x={room.x}
                    y={room.y}
                    width={room.width}
                    height={room.height}
                    className={shapeClasses}
                />
            )}

            {points && <polygon points={points} className={shapeClasses} />}
        </g>
    );
};
export default Room;
