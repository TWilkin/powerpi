import { IFloorplan } from "./floorplan";
import { ISchedule } from "./schedule";
import { ISensor } from "./sensor";
import { IUser } from "./user";

export interface IDeviceConfig {
    name: string;
    type: string;
    display_name?: string;
    visible?: boolean;
    location?: string;
    categories?: string[];
}

export interface IDeviceConfigFile {
    devices?: IDeviceConfig[];
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
