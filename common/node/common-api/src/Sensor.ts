import BaseDevice from "./BaseDevice";
import Battery from "./Battery";
import { Metric, MetricNumericType, MetricStateType } from "./Metric";

export type SensorNumericValue = {
    value?: number;
    unit?: string;
    since: number;
};

export type SensorStateValue = {
    state?: string;
    since: number;
};

export type SensorNumericData = {
    [key in MetricNumericType]?: SensorNumericValue;
};

export type SensorStateData = {
    [key in MetricStateType]?: SensorStateValue;
};

export type SensorData = SensorNumericData & SensorStateData;

export default interface Sensor extends BaseDevice, Battery {
    entity?: string;
    action?: string;
    metrics?: Metric;
    data: SensorData;
    battery?: number;
    batterySince?: number;
}
