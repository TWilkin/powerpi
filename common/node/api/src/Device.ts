import BaseDevice from "./BaseDevice";
import Battery from "./Battery";
import DeviceState from "./DeviceState";

export default interface Device extends BaseDevice, Battery {
    state: DeviceState;
    since: number;
}
