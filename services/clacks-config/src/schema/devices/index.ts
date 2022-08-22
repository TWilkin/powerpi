import * as BaseDevice from "./BaseDevice.schema.json";
import loadEnergenieSchema from "./energenie";
import loadHarmonySchema from "./harmony";
import loadLIFXSchema from "./lifx";
import loadMacroSchema from "./macro";
import * as PollableDevice from "./PollableDevice.schema.json";

export default function loadDevicesSchema() {
    return {
        // the base device/sensor
        BaseDevice,

        // mixins with configurable properties
        PollableDevice,

        // the Energenie controller devices
        ...loadEnergenieSchema(),

        // the Harmony controller devices
        ...loadHarmonySchema(),

        // the LIFX controller devices
        ...loadLIFXSchema(),

        // the macro controller devices
        ...loadMacroSchema(),
    };
}
