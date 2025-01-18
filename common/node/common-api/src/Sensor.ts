import BaseDevice from "./BaseDevice";
import Battery from "./Battery";

export enum MetricValue {
    none,
    read,
    visible,
}

export type Metric = {
    power?: MetricValue;
    current?: MetricValue;
    voltage?: MetricValue;
};

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
