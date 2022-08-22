import * as EnergenieCommon from "./EnergenieCommon.schema.json";
import * as EnergenieSocket from "./EnergenieSocket.schema.json";
import * as EnergenieSocketGroup from "./EnergenieSocketGroup.schema.json";

export default function loadEnergenieSchema() {
    return {
        EnergenieCommon,
        EnergenieSocket,
        EnergenieSocketGroup,
    };
}
