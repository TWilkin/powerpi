import * as AqaraDoor from "./AqaraDoor.schema.json";
import * as InnrLight from "./InnrLight.schema.json";
import * as OsramSwitchMini from "./OsramSwitchMini.schema.json";
import * as ZigBeeDevice from "./ZigBeeDevice.schema.json";
import * as ZigBeePairing from "./ZigBeePairing.schema.json";

export default function loadZigBeeSchema() {
    return {
        ZigBeeDevice,
        ZigBeePairing,

        // Aqara
        AqaraDoor,

        // Innr
        InnrLight,

        // Osram
        OsramSwitchMini,
    };
}
