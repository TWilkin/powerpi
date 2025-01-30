import { Sensor, SensorNumericData, SensorStateData } from "@powerpi/common-api";
import QueryKeyFactory from "./QueryKeyFactory";
import usePatcher from "./usePatcher";

type StateChange = {
    type: "State";
    data: SensorStateData;
};

type DataChange = {
    type: "Data";
    data: SensorNumericData;
};

type BatteryChange = { type: "Battery" } & Pick<Sensor, "battery" | "charging" | "batterySince">;

export type SensorPatch = StateChange | DataChange | BatteryChange;

export default function useSensorPatcher() {
    return usePatcher<Sensor, SensorPatch>(QueryKeyFactory.sensors);
}
