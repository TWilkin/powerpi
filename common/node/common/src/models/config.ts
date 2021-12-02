import { ISchedule } from "./schedule";
import { IDevice } from "./device";
import { IUser } from "./user";

export interface IDeviceConfigFile {
    devices: IDevice[];
}

export interface IScheduleConfigFile {
    timezone: string;
    schedules: ISchedule[];
}

export interface IUserConfigFile {
    users: IUser[];
}
