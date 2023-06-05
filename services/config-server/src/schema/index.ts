import loadCommonSchema from "./common";
import loadConfigSchema from "./config";
import loadDevicesSchema from "./devices";

export default function loadSchema() {
    return {
        // the common schema used by the config schema
        common: loadCommonSchema(),

        // the devices schema
        devices: loadDevicesSchema(),

        // the config schema
        config: loadConfigSchema(),
    };
}
