import { Floor, Floorplan, Point, PolygonRoom, RectangleRoom, Room } from "@powerpi/common-api";

/** Check whether the supplied room is using rectangle coordinates. */
export function isRectangleRoom(room: RectangleRoom | PolygonRoom): room is RectangleRoom {
    return "width" in room && room.width != null;
}

/** Check whether the supplied room is using polygon coordinates. */
export function isPolygonRoom(room: RectangleRoom | PolygonRoom): room is PolygonRoom {
    return "points" in room && room.points != null;
}

export class ViewBox {
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

export function viewBoxByFloorplan(floorplan: Floorplan) {
    return floorplan.floors
        .map((floor) => viewBoxByFloor(floor))
        .reduce((viewBox, floor) => viewBox.join(floor), new ViewBox());
}

function viewBoxByFloor(floor: Floor) {
    return floor.rooms
        .map((room) => viewBoxByRoom(room))
        .reduce((viewBox, room) => viewBox.join(room), new ViewBox());
}

function viewBoxByRoom(room: Room) {
    // convert the room into a list of points
    const points: Point[] = [];
    if (isRectangleRoom(room)) {
        points.push(...pointsFromRect(room.x, room.y, room.width, room.height));
    } else {
        points.push(...room.points);
    }

    // now get the min/max values
    const viewBox = points.reduce(
        (viewBox, point) => viewBox.update(point.x, point.y),
        new ViewBox(),
    );

    return viewBox;
}

export function pointsFromRect(x = 0, y = 0, width = 0, height = 0): Point[] {
    return [
        { x, y },
        { x: x + width, y: y },
        { x, y: y + height },
        { x: x + width, y: y + height },
    ];
}
