import BaseDevice from "./BaseDevice";
import Battery from "./Battery";
import { Metric } from "./Metric";

export type SensorNumericValue = {
    value?: number;
    unit?: string;
    since: number;
};

export type SensorStateValue = {
    state?: string;
    since: number;
};

export type SensorData = {
    current?: SensorNumericValue;
    door?: SensorStateValue;
    humidity?: SensorNumericValue;
    motion?: SensorStateValue;
    power?: SensorNumericValue;
    voltage?: SensorNumericValue;
    temperature?: SensorNumericValue;
    window?: SensorStateValue;
};

export default interface Sensor extends BaseDevice, Battery {
    entity?: string;
    action?: string;
    metrics?: Metric;
    data: SensorData;
    battery?: number;
    batterySince?: number;
}
