import { IDevice } from "./device";
import { IFloorplan } from "./floorplan";
import { ISchedule } from "./schedule";
import { ISensor } from "./sensor";
import { IUser } from "./user";

export interface IDeviceConfigFile {
    devices?: IDevice[];
    sensors?: ISensor[];
}

export interface IFloorplanConfigFile {
    floorplan: IFloorplan;
}

export interface IScheduleConfigFile {
    timezone: string;
    schedules: ISchedule[];
}

export interface IUserConfigFile {
    users: IUser[];
}
