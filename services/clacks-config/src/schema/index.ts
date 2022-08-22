import loadCommonSchema from "./common";
import loadDevicesSchema from "./devices";
import * as devices from "./devices.schema.json";
import * as events from "./events.schema.json";
import * as floorplan from "./floorplan.schema.json";
import * as schedules from "./schedules.schema.json";
import * as users from "./users.schema.json";

export default function loadSchema() {
    return {
        // the common schema used by the config schema
        common: loadCommonSchema(),

        // the devices schema
        devices: loadDevicesSchema(),

        // the config schema
        config: {
            devices,
            events,
            floorplan,
            schedules,
            users,
        },
    };
}
