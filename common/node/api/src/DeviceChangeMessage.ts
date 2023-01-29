import AdditionalState from "./AdditionalState";
import DeviceState from "./DeviceState";

export default interface ChangeMessage extends AdditionalState {
    state?: DeviceState;
}
