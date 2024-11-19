import { Floor, Floorplan, Point, Room } from "@powerpi/common-api";
import { useMemo } from "react";
import { isPolygonRoom, isRectangleRoom, pointsFromRect, viewBoxByFloorplan } from "./ViewBox";

export default function useRotateFloorplan(floorplan: Floorplan, rotate: boolean) {
    return useMemo(() => {
        const viewBox = viewBoxByFloorplan(floorplan);

        if (!rotate) {
            return {
                floorplan,
                viewBox,
            };
        }

        const radians = degreesToRadians(90);

        const centre = {
            x: (viewBox.maxX - viewBox.minX) / 2,
            y: (viewBox.maxY - viewBox.minY) / 2,
        };

        const rotatedFloorplan = rotateFloorplan(floorplan, radians, centre);

        const rotatedViewBox = viewBoxByFloorplan(rotatedFloorplan);

        if (rotatedViewBox.minX !== 0 || rotatedViewBox.minY !== 0) {
            const offset = {
                x: -rotatedViewBox.minX,
                y: -rotatedViewBox.minY,
            };

            const translatedFloorplan = translateFloorplan(rotatedFloorplan, offset);

            const translatedViewBox = viewBoxByFloorplan(translatedFloorplan);

            return {
                floorplan: translatedFloorplan,
                viewBox: translatedViewBox,
            };
        }

        return {
            floorplan: rotatedFloorplan,
            viewBox: rotatedViewBox,
        };
    }, [floorplan, rotate]);
}

function degreesToRadians(degrees: number) {
    return (degrees * Math.PI) / 180;
}

function rotateFloorplan(floorplan: Floorplan, radians: number, centre: Point): Floorplan {
    const floors = floorplan.floors.map((floor) => rotateFloor(floor, radians, centre));

    return {
        ...floorplan,
        floors,
    };
}

function rotateFloor(floor: Floor, radians: number, centre: Point): Floor {
    const rooms = floor.rooms.map((room) => rotateRoom(room, radians, centre));

    return {
        ...floor,
        rooms,
    };
}

function rotateRoom(room: Room, radians: number, centre: Point): Room {
    // if it's a rectangle convert to points for convenience
    let points = isPolygonRoom(room)
        ? room.points
        : pointsFromRect(room.x, room.y, room.width, room.height);

    // now everything is a polygon so just rotate it
    points = points.map((point) => rotate(point, radians, centre));

    // if it was a rectangle we want to convert it back
    if (points.length === 4) {
        const x = Math.min(...points.map((point) => point.x));
        const y = Math.min(...points.map((point) => point.y));
        const width = Math.max(...points.map((point) => point.x)) - x;
        const height = Math.max(...points.map((point) => point.y)) - y;

        return {
            ...room,
            points: undefined,
            x,
            y,
            width,
            height,
        };
    }

    return {
        ...room,
        points,
    };
}

function rotate(point: Point, radians: number, centre: Point): Point {
    const sin = Math.sin(radians);
    const cos = Math.cos(radians);

    return {
        x: cos * (point.x - centre.x) - sin * (point.y - centre.y) + centre.x,
        y: sin * (point.x - centre.x) - cos * (point.y - centre.y) + centre.y,
    };
}

function translateFloorplan(floorplan: Floorplan, offset: Point): Floorplan {
    const floors = floorplan.floors.map((floor) => translateFloor(floor, offset));

    return {
        ...floorplan,
        floors,
    };
}

function translateFloor(floor: Floor, offset: Point): Floor {
    const rooms = floor.rooms.map((room) => translateRoom(room, offset));

    return {
        ...floor,
        rooms,
    };
}

function translateRoom(room: Room, offset: Point): Room {
    if (isRectangleRoom(room)) {
        const point = { x: room.x ?? 0, y: room.y ?? 0 };
        const translated = translate(point, offset);

        return {
            ...room,
            x: translated.x,
            y: translated.y,
        };
    }

    return {
        ...room,
        points: room.points.map((point) => translate(point, offset)),
    };
}

function translate(point: Point, offset: Point): Point {
    return {
        x: point.x + offset.x,
        y: point.y + offset.y,
    };
}
