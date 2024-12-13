export enum Weekday {
    Sunday,
    Monday,
    Tuesday,
    Wednesday,
    Thursday,
    Friday,
    Saturday,
}

type DeviceSchedule = {
    device?: string;
    devices?: string[];
    days?: Weekday[];
    power?: boolean;
};

export type DeviceInternalSchedule = DeviceSchedule & {
    between: string[];
    interval: number;
    force?: boolean;
    hue?: number[];
    saturation?: number[];
    brightness?: number[];
    temperature?: number[];
};

export type DeviceSingleSchedule = DeviceSchedule & {
    at: string;
    hue?: number;
    saturation?: number;
    brightness?: number;
    temperature?: number;
};

export type ISchedule = DeviceInternalSchedule | DeviceSingleSchedule;
