import * as BaseDevice from "./BaseDevice.schema.json";
import loadEnergenieSchema from "./energenie";
import loadHarmonySchema from "./harmony";
import loadLIFXSchema from "./lifx";
import * as MeterSensor from "./MeterSensor.schema.json";
import * as Metric from "./Metric.schema.json";
import loadNetworkSchema from "./network";
import * as PollableDevice from "./PollableDevice.schema.json";
import * as PowerPiSensor from "./PowerPiSensor.schema.json";
import * as Sensor from "./Sensor.schema.json";
import loadSnapcastSchema from "./snapcast";
import loadVirtualSchema from "./virtual";
import loadZigBeeSchema from "./zigbee";

export default function loadDevicesSchema() {
    return {
        // common types
        Metric,

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

        // the network controller devices
        ...loadNetworkSchema(),

        // the snapcast controller devices
        ...loadSnapcastSchema(),

        // the virtual controller devices
        ...loadVirtualSchema(),

        // the zigbee controller devices
        ...loadZigBeeSchema(),

        // PowerPi sensors
        MeterSensor,
        PowerPiSensor,
    };
}
