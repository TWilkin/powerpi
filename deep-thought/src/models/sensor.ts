import { ISensor } from "@powerpi/common";

export interface Sensor extends ISensor {
    state: string | undefined;
    value: number | undefined;
    unit: string | undefined;
    since: number;
}
