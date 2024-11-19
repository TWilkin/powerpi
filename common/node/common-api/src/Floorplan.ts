export type Floorplan = {
    floors: Floor[];
};

export type Floor = {
    name: string;
    display_name?: string;
    rooms: Room[];
};

export type PolygonRoom = {
    points: Point[];
};

export type RectangleRoom = {
    width?: number;
    height?: number;
};

export type Room = {
    name: string;
    display_name?: string;
    x?: number;
    y?: number;
} & (PolygonRoom | RectangleRoom);

export type Point = {
    x: number;
    y: number;
};
