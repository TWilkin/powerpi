import DeviceState from "./DeviceState";

export default interface Device {
    name: string;
    display_name: string;
    visible: boolean;
    type: string;
    state: DeviceState;
    since: number;
}
