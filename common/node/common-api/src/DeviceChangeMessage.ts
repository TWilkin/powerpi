import AdditionalState from "./AdditionalState";
import DeviceState from "./DeviceState";

export default interface ChangeMessage extends AdditionalState {
    state?: DeviceState;
}

export type DeviceChangeMessage = {
    device: string;
} & ChangeMessage;

export type DeviceChangeCallback = (message: DeviceChangeMessage) => void;
