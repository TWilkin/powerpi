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
    x?: number;
    y?: number;
    width?: number;
    height?: number;
};

export type Room = {
    name: string;
    display_name?: string;
} & (PolygonRoom | RectangleRoom);

export type Point = {
    x: number;
    y: number;
};
