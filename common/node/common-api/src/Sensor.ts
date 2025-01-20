import BaseDevice from "./BaseDevice";
import Battery from "./Battery";
import { Metric } from "./Metric";

export default interface Sensor extends BaseDevice, Battery {
    entity?: string;
    action?: string;
    state?: string;
    value?: number;
    unit?: string;
    since: number;
    battery?: number;
    batterySince?: number;
    metrics?: Metric;
}
