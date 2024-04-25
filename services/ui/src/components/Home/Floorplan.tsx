import {
    Floor as IFloor,
    Floorplan as IFloorplan,
    Point as IPoint,
    Room as IRoom,
} from "@powerpi/common-api";
import classNames from "classnames";
import { useMemo } from "react";
import { useParams } from "react-router-dom";
import useOrientation from "../../hooks/orientation";
import styles from "./Floorplan.module.scss";
import RoomIcons from "./RoomIcons";

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

    return (
        <div className={styles.layout}>
            <svg
                viewBox={`${size.minX} ${size.minY} ${size.maxX} ${size.maxY}`}
                preserveAspectRatio="xMidYMid"
                className={classNames({ [styles.rotate]: rotate, [styles.wide]: isWide })}
            >
                <defs>
                    {floorplan.floors.map((floor) => (
                        <RoomOutline key={floor.name} floor={floor} />
                    ))}
                </defs>

                {floorplan.floors.map((floor) => (
                    <Floor
                        key={floor.name}
                        floor={floor}
                        visible={params.floor === floor.name}
                        rotate={rotate}
                    />
                ))}
            </svg>
        </div>
    );
};
export default Floorplan;

const RoomOutline = ({ floor }: { floor: IFloor }) => {
    const size = useMemo(() => viewBoxByFloor(floor), [floor]);

    return (
        <filter
            id={outlineId(floor)}
            x={size.minX}
            y={size.minY}
            width={size.maxX}
            height={size.maxY}
            filterUnits="userSpaceOnUse"
        >
            <feMorphology operator="dilate" in="SourceAlpha" radius={2} result="morph1" />
            <feMorphology operator="dilate" in="SourceAlpha" radius={3} result="morph2" />
            <feComposite in="morph1" in2="morph2" operator="xor" result="outline" />
            <feComposite in="outline" in2="SourceGraphic" operator="over" result="output" />
        </filter>
    );
};

interface FloorProps {
    floor: IFloor;
    visible: boolean;
    rotate: boolean;
}

const Floor = ({ floor, visible, rotate }: FloorProps) => {
    return (
        <g
            id={floor.name}
            filter={`url(#${outlineId(floor)})`}
            className={classNames(styles.floor, { [styles.visible]: visible })}
        >
            <title>{floor.display_name ?? floor.name}</title>

            {floor.rooms.map((room) => (
                <Room key={room.name} room={room} floor={floor.name} rotate={rotate} />
            ))}
        </g>
    );
};

interface RoomProps {
    room: IRoom;
    floor: string;
    rotate: boolean;
}

const Room = ({ room, floor, rotate }: RoomProps) => {
    const id = useMemo(() => `${floor}${room.name}`, [floor, room]);

    if (isRect(room)) {
        return (
            <g id={id} data-tooltip-id={id}>
                <rect x={room.x} y={room.y} width={room.width} height={room.height} />
                <RoomIcons room={room} rotate={rotate} />
            </g>
        );
    } else if (isPolygon(room)) {
        const points = room.points?.map((point) => `${point.x},${point.y}`).join(" ");

        return (
            <g id={id} data-tooltip-id={id}>
                <polygon points={points} />
                <RoomIcons room={room} rotate={rotate} />
            </g>
        );
    }

    return <></>;
};

const outlineId = (floor: IFloor) => `${floor.name}Outline`;

const isRect = (room: IRoom) =>
    room.width && room.height && (!room.points || room.points.length === 0);

const isPolygon = (room: IRoom) =>
    !room.width && !room.height && room.points && room.points.length !== 0;

class ViewBox {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;

    constructor() {
        this.minX = Number.MAX_VALUE;
        this.minY = Number.MAX_VALUE;
        this.maxX = 0;
        this.maxY = 0;
    }

    pad(size = 5) {
        this.minX -= size;
        this.minY -= size;
        this.maxX += size;
        this.maxY += size;

        return this;
    }

    join(viewBox: ViewBox) {
        this.minX = Math.min(this.minX, viewBox.minX);
        this.minY = Math.min(this.minY, viewBox.minY);
        this.maxX = Math.max(this.maxX, viewBox.maxX);
        this.maxY = Math.max(this.maxY, viewBox.maxY);

        return this;
    }

    update(x: number, y: number) {
        this.minX = Math.min(this.minX, x);
        this.minY = Math.min(this.minY, y);
        this.maxX = Math.max(this.maxX, x);
        this.maxY = Math.max(this.maxY, y);

        return this;
    }
}

const viewBoxByFloorplan = (floorplan: IFloorplan) =>
    floorplan.floors
        .map((floor) => viewBoxByFloor(floor))
        .reduce((viewBox, floor) => viewBox.join(floor), new ViewBox())
        .pad();

const viewBoxByFloor = (floor: IFloor) =>
    floor.rooms
        .map((room) => viewBoxByRoom(room))
        .reduce((viewBox, room) => viewBox.join(room), new ViewBox());

function viewBoxByRoom(room: IRoom) {
    // convert the room into a list of points
    const points: IPoint[] = [];
    if (isRect(room)) {
        points.push(...pointsFromRect(room.x, room.y, room.width, room.height));
    } else if (isPolygon(room)) {
        points.push(...(room.points ?? []));
    }

    // now get the min/max values
    const viewBox = points.reduce(
        (viewBox, point) => viewBox.update(point.x, point.y),
        new ViewBox(),
    );

    return viewBox;
}

function pointsFromRect(x = 0, y = 0, width = 0, height = 0): IPoint[] {
    return [
        { x, y },
        { x: x + width, y: y },
        { x, y: y + height },
        { x: x + width, y: y + height },
    ];
}
