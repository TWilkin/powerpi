import loadCommonSchema from "./common/index.js";
import loadConfigSchema from "./config/index.js";
import loadDevicesSchema from "./devices/index.js";
import loadSchedulesSchema from "./schedules/index.js";

export default function loadSchema() {
    return {
        // the common schema used by the config schema
        common: loadCommonSchema(),

        // the devices schema
        devices: loadDevicesSchema(),

        // the schedules schema
        schedules: loadSchedulesSchema(),

        // the config schema
        config: loadConfigSchema(),
    };
}
