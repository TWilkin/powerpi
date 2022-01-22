export interface IFloorplan {
    floors: Floor[];
}

export interface Floor {
    name: string;
    display_name?: string;
    rooms: Room[];
}

export interface Room {
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    points?: Point[];
}

export interface Point {
    x: number;
    y: number;
}
