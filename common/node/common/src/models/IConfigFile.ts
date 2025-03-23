import { IFloorplan } from "./IFloorplan.js";
import { ISchedule } from "./ISchedule.js";
import { IUser } from "./IUser.js";

export interface IDeviceConfig {
    name: string;
    type: string;
    display_name?: string;
    visible?: boolean;
    location?: string;
    categories?: string[];
}

export interface ISensorConfig {
    name: string;
    type: string;
    display_name?: string;
    location: string;
    entity?: string;
    action?: string;
    visible?: boolean;
}

export interface IDeviceConfigFile {
    devices?: IDeviceConfig[];
    sensors?: ISensorConfig[];
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
