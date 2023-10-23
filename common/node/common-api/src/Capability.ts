export interface MinMax {
    min: number;
    max: number;
}

export default interface Capability {
    brightness?: boolean;
    colour?: {
        temperature?: boolean | MinMax;
        hue?: boolean;
        saturation?: boolean;
    };
    streams?: string[];
}
