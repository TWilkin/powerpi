export enum Weekday {
    Sunday,
    Monday,
    Tuesday,
    Wednesday,
    Thursday,
    Friday,
    Saturday,
}

export interface ISchedule {
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
