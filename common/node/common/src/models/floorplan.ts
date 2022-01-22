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
    display_name?: string;
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
