import AdditionalState from "./AdditionalState";
import DeviceState from "./DeviceState";

export interface DeviceStatusMessage {
    device: string;
    state: DeviceState;
    timestamp: number;
    additionalState: AdditionalState;
}

export type DeviceStatusCallback = (message: DeviceStatusMessage) => void;
