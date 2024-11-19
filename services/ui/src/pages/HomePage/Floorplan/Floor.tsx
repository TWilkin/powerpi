import { Floor as IFloor } from "@powerpi/common-api";
import Room from "./Room";

type FloorProps = {
    floor: IFloor;
};

/** Component representing a floor in the home floorplan. */
const Floor = ({ floor }: FloorProps) => (
    <g>
        {floor.rooms.map((room) => (
            <Room key={room.name} room={room} />
        ))}
    </g>
);
export default Floor;
