import * as MeterSensor from "./MeterSensor.schema.json" with { type: "json" };

export default function loadEnergyMonitorSchema() {
    return {
        MeterSensor,
    };
}
