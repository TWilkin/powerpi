import AdditionalState from "./AdditionalState.js";
import BaseDevice from "./BaseDevice.js";
import Battery from "./Battery.js";
import Capability from "./Capability.js";
import DeviceState from "./DeviceState.js";

export default interface Device extends BaseDevice, Battery {
    state: DeviceState;
    since: number;
    additionalState?: AdditionalState;
    capability?: Capability;
}
