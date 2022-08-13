import BaseDevice from "./BaseDevice";

export default interface Sensor extends BaseDevice {
    entity?: string;
    action?: string;
    state?: string;
    value?: number;
    unit?: string;
    since: number;
    battery?: number;
    batterySince?: number;
}
