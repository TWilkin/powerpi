import DeviceState from "./DeviceState";

export interface DeviceStatusMessage {
    device: string;
    state: DeviceState;
    timestamp: number;
}

export type DeviceStatusCallback = (message: DeviceStatusMessage) => void;
