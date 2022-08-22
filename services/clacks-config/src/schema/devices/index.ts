import * as BaseDevice from "./BaseDevice.schema.json";
import * as HarmonyHub from "./harmony/HarmonyHub.schema.json";
import * as PollableDevice from "./PollableDevice.schema.json";

export default function loadDevicesSchema() {
    return {
        BaseDevice,
        PollableDevice,

        // the harmony controller devices
        HarmonyHub,
    };
}
