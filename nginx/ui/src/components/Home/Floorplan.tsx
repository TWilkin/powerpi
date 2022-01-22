import React from "react";
import { useMemo } from "react";

export interface IFloorplan {
    floors: IFloor[];
}

export interface IFloor {
    name: string;
    display_name?: string;
    rooms: IRoom[];
}

export interface IRoom {
    name: string;
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    points?: IPoint[];
}

export interface IPoint {
    x: number;
    y: number;
}

interface FloorplanProps {
    floorplan: IFloorplan;
}

const Floorplan = ({ floorplan }: FloorplanProps) => {
    const size = useMemo(() => viewBox(floorplan), [floorplan]);

    return (
        <div id="layout">
            <svg
                viewBox={`${size.minX} ${size.minY} ${size.maxX} ${size.maxY}`}
                preserveAspectRatio="xMidYMid"
            >
                {floorplan.floors.map((floor) => (
                    <Floor key={floor.name} floor={floor} />
                ))}
            </svg>
        </div>
    );
};
export default Floorplan;

const Floor = ({ floor }: { floor: IFloor }) => {
    return (
        <g id={floor.name}>
            <title>{floor.display_name ?? floor.name}</title>

            {floor.rooms.map((room) => (
                <Room key={room.name} room={room} />
            ))}
        </g>
    );
};

const Room = ({ room }: { room: IRoom }) => {
    if (isRect(room)) {
        return (
            <rect
                id={room.name}
                x={room.x}
                y={room.y}
                width={room.width}
                height={room.height}
                data-tip
                data-for={room.name}
            />
        );
    } else if (isPolygon(room)) {
        const points = room.points?.map((point) => `${point.x},${point.y}`).join(" ");

        return <polygon id={room.name} points={points} data-tip data-for={room.name} />;
    }

    return <></>;
};

const isRect = (room: IRoom) =>
    room.width && room.height && (!room.points || room.points.length === 0);

const isPolygon = (room: IRoom) =>
    !room.width && !room.height && room.points && room.points.length !== 0;

function viewBox(floorplan: IFloorplan) {
    // convert all the rooms into a list of points
    const points = floorplan.floors.reduce((points, floor) => {
        points.push(
            ...floor.rooms.reduce((points, room) => {
                if (isRect(room)) {
                    points.push(...pointsFromRect(room.x, room.y, room.width, room.height));
                } else if (isPolygon(room)) {
                    points.push(...(room.points ?? []));
                }

                return points;
            }, [] as IPoint[])
        );

        return points;
    }, [] as IPoint[]);

    // now get the min/max values
    const viewBox = points.reduce(
        (viewBox, point) => {
            if (point.x < viewBox.minX) {
                viewBox.minX = point.x;
            } else if (point.x > viewBox.maxX) {
                viewBox.maxX = point.x;
            }

            if (point.y < viewBox.minY) {
                viewBox.minY = point.y;
            } else if (point.y > viewBox.maxY) {
                viewBox.maxY = point.y;
            }

            return viewBox;
        },
        {
            minX: Number.MAX_VALUE,
            minY: Number.MAX_VALUE,
            maxX: 0,
            maxY: 0,
        }
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
