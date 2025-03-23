import AdditionalState from "./AdditionalState.js";
import DeviceState from "./DeviceState.js";

export default interface ChangeMessage extends AdditionalState {
    state?: DeviceState;
}

export type DeviceChangeMessage = {
    device: string;
    timestamp: number;
} & ChangeMessage;

export type DeviceChangeCallback = (message: DeviceChangeMessage) => void;
