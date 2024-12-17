import { Device } from "@powerpi/common-api";
import QueryKeyFactory from "./QueryKeyFactory";
import usePatcher from "./usePatcher";

type StateChange = { type: "State" } & Pick<Device, "state" | "additionalState" | "since">;
type CapabilityChange = { type: "Capability" } & Pick<Device, "capability" | "since">;
type BatteryChange = { type: "Battery" } & Pick<Device, "battery" | "charging" | "batterySince">;

export type DevicePatch = StateChange | CapabilityChange | BatteryChange;

export default function useDevicePatcher() {
    return usePatcher<Device, DevicePatch>(QueryKeyFactory.devices);
}
