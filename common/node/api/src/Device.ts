import BaseDevice from "./BaseDevice";
import DeviceState from "./DeviceState";

export default interface Device extends BaseDevice {
    state: DeviceState;
    since: number;
}
