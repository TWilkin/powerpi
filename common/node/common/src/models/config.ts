import { ISchedule } from "./schedule";
import { IDevice } from "./device";
import { IUser } from "./user";
import { ISensor } from "./sensor";

export interface IDeviceConfigFile {
    devices?: IDevice[];
    sensors?: ISensor[];
}

export interface IScheduleConfigFile {
    timezone: string;
    schedules: ISchedule[];
}

export interface IUserConfigFile {
    users: IUser[];
}
