import * as EnergenieCommon from "./EnergenieCommon.schema.json" with { type: "json" };
import * as EnergeniePairing from "./EnergeniePairing.schema.json" with { type: "json" };
import * as EnergenieSocket from "./EnergenieSocket.schema.json" with { type: "json" };
import * as EnergenieSocketGroup from "./EnergenieSocketGroup.schema.json" with { type: "json" };

export default function loadEnergenieSchema() {
    return {
        EnergenieCommon,
        EnergeniePairing,
        EnergenieSocket,
        EnergenieSocketGroup,
    };
}
