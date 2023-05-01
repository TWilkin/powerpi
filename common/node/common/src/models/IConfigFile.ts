import { IFloorplan } from "./IFloorplan";
import { ISchedule } from "./ISchedule";
import { ISensor } from "./ISensor";
import { IUser } from "./IUser";

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
