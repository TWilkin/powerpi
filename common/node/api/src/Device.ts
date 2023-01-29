import AdditionalState from "./AdditionalState";
import BaseDevice from "./BaseDevice";
import Battery from "./Battery";
import Capability from "./Capability";
import DeviceState from "./DeviceState";

export default interface Device extends BaseDevice, Battery {
    state: DeviceState;
    since: number;
    additionalState?: AdditionalState;
    capability?: Capability;
}
