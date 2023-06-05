import * as BaseDevice from "./BaseDevice.schema.json";
import loadEnergenieSchema from "./energenie";
import * as GenericSensor from "./GenericSensor.schema.json";
import loadHarmonySchema from "./harmony";
import loadLIFXSchema from "./lifx";
import loadMacroSchema from "./macro";
import loadNetworkSchema from "./network";
import loadNodeSchema from "./node";
import * as PollableDevice from "./PollableDevice.schema.json";
import * as PowerPiSensor from "./PowerPiSensor.schema.json";
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

        // the network controller devices
        ...loadNetworkSchema(),

        // the node controller devices
        ...loadNodeSchema(),

        // the zigbee controller devices
        ...loadZigBeeSchema(),

        // PowerPi sensors
        PowerPiSensor,

        // other sensors outside of PowerPi
        GenericSensor,
    };
}