import * as AqaraDoorWindow from "./AqaraDoorWindow.schema.json" with { type: "json" };
import * as IkeaStyrbarSwitch from "./IkeaStyrbarSwitch.schema.json" with { type: "json" };
import * as OsramSwitchMini from "./OsramSwitchMini.schema.json" with { type: "json" };
import * as SonoffSwitch from "./SonoffSwitch.schema.json" with { type: "json" };
import * as ZigBeeDevice from "./ZigBeeDevice.schema.json" with { type: "json" };
import * as ZigBeeEnergyMonitor from "./ZigBeeEnergyMonitor.schema.json" with { type: "json" };
import * as ZigBeeLight from "./ZigBeeLight.schema.json" with { type: "json" };
import * as ZigBeePairing from "./ZigBeePairing.schema.json" with { type: "json" };
import * as ZigBeeSocket from "./ZigBeeSocket.schema.json" with { type: "json" };

export default function loadZigBeeSchema() {
    return {
        ZigBeeDevice,
        ZigBeeLight,
        ZigBeePairing,
        ZigBeeSocket,
        ZigBeeEnergyMonitor,

        // Aqara
        AqaraDoorWindow,

        // Ikea
        IkeaStyrbarSwitch,

        // Osram
        OsramSwitchMini,

        // Sonoff
        SonoffSwitch,
    };
}
