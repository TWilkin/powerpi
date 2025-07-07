import * as ElectricityMeter from "./ElectricityMeter.schema.json" with { type: "json" };
import * as GasMeter from "./GasMeter.schema.json" with { type: "json" };
import * as OctopusAccountNumber from "./OctopusAccountNumber.schema.json" with { type: "json" };
import * as OctopusElectricityMeter from "./OctopusElectricityMeter.schema.json" with { type: "json" };
import * as OctopusGasMeter from "./OctopusGasMeter.schema.json" with { type: "json" };

export default function loadEnergyMonitorSchema() {
    return {
        // the common energy meter types
        ElectricityMeter,
        GasMeter,

        // Octopus energy meters
        OctopusAccountNumber,
        OctopusElectricityMeter,
        OctopusGasMeter,
    };
}
