type DeviceSchedule = {
    device?: string;
    devices?: string[];
    schedule: string;
    power?: boolean;
};

export type DeviceInternalSchedule = DeviceSchedule & {
    duration: number;
    interval: number;
    force?: boolean;
    hue?: number[];
    saturation?: number[];
    brightness?: number[];
    temperature?: number[];
};

export type DeviceSingleSchedule = DeviceSchedule & {
    hue?: number;
    saturation?: number;
    brightness?: number;
    temperature?: number;
};

export type ISchedule = DeviceInternalSchedule | DeviceSingleSchedule;
