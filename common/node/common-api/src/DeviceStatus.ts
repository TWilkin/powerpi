import AdditionalState from "./AdditionalState.js";
import DeviceState from "./DeviceState.js";

export interface DeviceStatusMessage {
    device: string;
    state: DeviceState;
    timestamp: number;
    additionalState: AdditionalState;
}

export type DeviceStatusCallback = (message: DeviceStatusMessage) => void;
