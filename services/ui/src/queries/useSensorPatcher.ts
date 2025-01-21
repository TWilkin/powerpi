import { Sensor, SensorData } from "@powerpi/common-api";
import QueryKeyFactory from "./QueryKeyFactory";
import usePatcher from "./usePatcher";

type StateChange = {
    type: "State";
    data: Pick<SensorData, "motion">;
};

type DataChange = {
    type: "Data";
    data: Omit<SensorData, "motion">;
};

type BatteryChange = { type: "Battery" } & Pick<Sensor, "battery" | "charging" | "batterySince">;

export type SensorPatch = StateChange | DataChange | BatteryChange;

export default function useSensorPatcher() {
    return usePatcher<Sensor, SensorPatch>(QueryKeyFactory.sensors);
}
