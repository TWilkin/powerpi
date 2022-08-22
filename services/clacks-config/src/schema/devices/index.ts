import * as BaseDevice from "./BaseDevice.schema.json";
import loadEnergenieSchema from "./energenie";
import * as GenericSensor from "./GenericSensor.schema.json";
import loadHarmonySchema from "./harmony";
import loadLIFXSchema from "./lifx";
import loadMacroSchema from "./macro";
import * as PollableDevice from "./PollableDevice.schema.json";
import * as Sensor from "./Sensor.schema.json";
import loadZigBeeSchema from "./zigbee";

export default function loadDevicesSchema() {
    return {
        // the base device/sensor
        BaseDevice,
        Sensor,

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

        // the zigbee controller devices
        ...loadZigBeeSchema(),

        // other sensors outside of Powerpi
        GenericSensor,
    };
}
