import loadCommonSchema from "./common";
import loadConfigSchema from "./config";
import loadDevicesSchema from "./devices";
import loadSchedulesSchema from "./schedules";

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
