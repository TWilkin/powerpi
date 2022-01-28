import { ISensor } from "@powerpi/common";

export interface Sensor extends ISensor {
    entity: string;
    action: string;
    state: string | undefined;
    value: number | undefined;
    unit: string | undefined;
    since: number;
}
