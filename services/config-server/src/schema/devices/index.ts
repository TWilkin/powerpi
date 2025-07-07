import * as BaseDevice from "./BaseDevice.schema.json" with { type: "json" };
import loadEnergenieSchema from "./energenie/index.js";
import loadEnergyMonitorSchema from "./energy-monitor/index.js";
import loadHarmonySchema from "./harmony/index.js";
import loadLIFXSchema from "./lifx/index.js";
import * as Metric from "./Metric.schema.json" with { type: "json" };
import loadNetworkSchema from "./network/index.js";
import * as PollableDevice from "./PollableDevice.schema.json" with { type: "json" };
import * as PowerPiSensor from "./PowerPiSensor.schema.json" with { type: "json" };
import * as Sensor from "./Sensor.schema.json" with { type: "json" };
import loadSnapcastSchema from "./snapcast/index.js";
import loadVirtualSchema from "./virtual/index.js";
import loadZigBeeSchema from "./zigbee/index.js";

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
        ...loadEnergyMonitorSchema(),
        PowerPiSensor,
    };
}
