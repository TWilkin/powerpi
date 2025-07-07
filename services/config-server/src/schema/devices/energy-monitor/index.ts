import * as ElectricityMeter from "./ElectricityMeter.schema.json" with { type: "json" };
import * as GasMeter from "./GasMeter.schema.json" with { type: "json" };

export default function loadEnergyMonitorSchema() {
    return {
        ElectricityMeter,
        GasMeter,
    };
}
