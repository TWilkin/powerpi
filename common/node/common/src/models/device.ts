import { IDeviceConfig } from "./config";

export interface IDevice extends IDeviceConfig {
    displayName: string;
}

export class Device implements IDevice {
    name: string;
    display_name?: string;
    type: string;

    constructor(name?: string, type?: string, displayName?: string) {
        this.name = name ?? "unknown";
        this.type = type ?? "unknown";
        this.display_name = displayName;
    }

    get displayName() {
        return this.display_name ?? this.name;
    }
}
