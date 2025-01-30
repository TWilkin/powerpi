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

type SensorNumericData = {
    [key in MetricNumericType]?: SensorNumericValue;
};

type SensorStateDate = {
    [key in MetricStateType]?: SensorStateValue;
};

export type SensorData = SensorNumericData & SensorStateDate;

export default interface Sensor extends BaseDevice, Battery {
    entity?: string;
    action?: string;
    metrics?: Metric;
    data: SensorData;
    battery?: number;
    batterySince?: number;
}
