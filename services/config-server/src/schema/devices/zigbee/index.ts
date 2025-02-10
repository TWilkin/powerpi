import * as AqaraDoorWindow from "./AqaraDoorWindow.schema.json";
import * as IkeaStyrbarSwitch from "./IkeaStyrbarSwitch.schema.json";
import * as OsramSwitchMini from "./OsramSwitchMini.schema.json";
import * as SonoffSwitch from "./SonoffSwitch.schema.json";
import * as ZigBeeDevice from "./ZigBeeDevice.schema.json";
import * as ZigBeeEnergyMonitor from "./ZigBeeEnergyMonitor.schema.json";
import * as ZigBeeLight from "./ZigBeeLight.schema.json";
import * as ZigBeePairing from "./ZigBeePairing.schema.json";
import * as ZigBeeSocket from "./ZigBeeSocket.schema.json";

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
