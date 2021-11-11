import { ISchedule } from "./schedule";
import { IDevice } from "./device";

export interface IDeviceConfigFile {
    devices: IDevice[];
}

export interface IScheduleConfigFile {
    timezone: string;
    schedules: ISchedule[];
}
