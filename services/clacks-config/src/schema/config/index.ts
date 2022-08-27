import * as devices from "./devices.schema.json";
import * as events from "./events.schema.json";
import * as floorplan from "./floorplan.schema.json";
import * as schedules from "./schedules.schema.json";
import * as users from "./users.schema.json";

export default function loadConfigSchema() {
    return {
        devices,
        events,
        floorplan,
        schedules,
        users,
    };
}
