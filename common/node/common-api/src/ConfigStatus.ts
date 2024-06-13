export enum ConfigFileType {
    Devices = "devices",
    Floorplan = "floorplan",
}

export type ConfigStatusMessage = { type: ConfigFileType };

export type ConfigStatusCallback = (message: ConfigStatusMessage) => Promise<void>;
