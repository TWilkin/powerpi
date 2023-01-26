export interface MinMax {
    min: number;
    max: number;
}

export default interface Capability {
    brightness?: boolean;
    temperature?: boolean | MinMax;
    hue?: boolean;
    saturation?: boolean;
}
