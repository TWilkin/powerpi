import { Floor as IFloor, Floorplan as IFloorplan, Room as IRoom } from "@powerpi/common-api";
import classNames from "classnames";
import { useMemo } from "react";
import { useParams } from "react-router-dom";
import useOrientation from "../../hooks/orientation";
import styles from "./Floorplan.module.scss";
import RoomIcons from "./RoomIcons";
import { isPolygon, isRect, viewBoxByFloorplan } from "./ViewBox";
import useRotateFloorplan from "./useRotateFloorplan";

interface FloorplanProps {
    floorplan: IFloorplan;
}

const Floorplan = ({ floorplan }: FloorplanProps) => {
    const params = useParams();
    const { isLandscape, isPortrait } = useOrientation();

    const size = useMemo(() => viewBoxByFloorplan(floorplan), [floorplan]);

    const isWide = useMemo(() => size.maxX >= size.maxY, [size]);

    const rotate = useMemo(
        () => (isWide && isPortrait) || (!isWide && isLandscape),
        [isWide, isLandscape, isPortrait],
    );

    const { floorplan: effectiveFloorplan, viewBox: effectiveViewBox } = useRotateFloorplan(
        floorplan,
        rotate,
    );

    return (
        <div className={styles.layout}>
            <svg
                viewBox={`${effectiveViewBox.minX} ${effectiveViewBox.minY} ${effectiveViewBox.maxX} ${effectiveViewBox.maxY}`}
                preserveAspectRatio="xMidYMid"
            >
                {effectiveFloorplan.floors.map((floor) => (
                    <Floor key={floor.name} floor={floor} visible={params.floor === floor.name} />
                ))}
            </svg>
        </div>
    );
};
export default Floorplan;

interface FloorProps {
    floor: IFloor;
    visible: boolean;
}

const Floor = ({ floor, visible }: FloorProps) => {
    return (
        <g id={floor.name} className={classNames(styles.floor, { [styles.visible]: visible })}>
            {floor.rooms.map((room) => (
                <Room key={room.name} room={room} floor={floor.name} />
            ))}
        </g>
    );
};

interface RoomProps {
    room: IRoom;
    floor: string;
}

const Room = ({ room, floor }: RoomProps) => {
    const id = useMemo(() => `${floor}${room.name}`, [floor, room]);

    if (isRect(room)) {
        return (
            <g id={id} data-tooltip-id={id}>
                <rect x={room.x} y={room.y} width={room.width} height={room.height} />
                <RoomIcons room={room} />
            </g>
        );
    } else if (isPolygon(room)) {
        const points = room.points?.map((point) => `${point.x},${point.y}`).join(" ");

        return (
            <g id={id} data-tooltip-id={id}>
                <polygon points={points} />
                <RoomIcons room={room} />
            </g>
        );
    }

    return <></>;
};
