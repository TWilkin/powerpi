import BaseDevice from "./BaseDevice";
import Battery from "./Battery";
import { Metric, MetricType } from "./Metric";

export type SensorNumericValue = {
    value: number;
    unit: string;
};

export type SensorStateValue = {
    state: string;
};

export type SensorValue = {
    since: number;
} & (SensorNumericValue | SensorStateValue);

export default interface Sensor extends BaseDevice, Battery {
    entity?: string;
    action?: string;
    metrics?: Metric;
    data: Record<MetricType, SensorValue>;
    battery?: number;
    batterySince?: number;
}
