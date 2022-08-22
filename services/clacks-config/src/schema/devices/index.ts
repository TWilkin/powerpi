import * as BaseDevice from "./BaseDevice.schema.json";
import * as EnergenieCommon from "./energenie/EnergenieCommon.schema.json";
import * as EnergenieSocket from "./energenie/EnergenieSocket.schema.json";
import * as EnergenieSocketGroup from "./energenie/EnergenieSocketGroup.schema.json";
import * as HarmonyHub from "./harmony/HarmonyHub.schema.json";
import * as PollableDevice from "./PollableDevice.schema.json";

export default function loadDevicesSchema() {
    return {
        BaseDevice,
        PollableDevice,

        // the Energenie controller devices
        EnergenieCommon,
        EnergenieSocket,
        EnergenieSocketGroup,

        // the Harmony controller devices
        HarmonyHub,
    };
}
