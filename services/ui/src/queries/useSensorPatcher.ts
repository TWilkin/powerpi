import { Sensor } from "@powerpi/common-api";
import QueryKeyFactory from "./QueryKeyFactory";
import usePatcher from "./usePatcher";

type StateChange = { type: "State" } & Pick<Sensor, "state" | "since">;
type DataChange = { type: "Data" } & Pick<Sensor, "value" | "unit" | "since">;
type BatteryChange = { type: "Battery" } & Pick<Sensor, "battery" | "batterySince">;

export type SensorPatch = StateChange | DataChange | BatteryChange;

export default function useSensorPatcher() {
    return usePatcher<Sensor, SensorPatch>(QueryKeyFactory.sensors);
}
