export enum Weekday {
    Sunday,
    Monday,
    Tuesday,
    Wednesday,
    Thursday,
    Friday,
    Saturday,
}

export default interface Schedule {
    device: string;
    days?: Weekday[];
    between: string[];
    interval: number;
    hue?: number[];
    saturation?: number[];
    brightness?: number[];
    kelvin?: number[];
    power?: boolean;
}
