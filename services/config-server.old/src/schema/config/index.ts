import * as devices from "./devices.schema.json" with { type: "json" };
import * as events from "./events.schema.json" with { type: "json" };
import * as floorplan from "./floorplan.schema.json" with { type: "json" };
import * as schedules from "./schedules.schema.json" with { type: "json" };
import * as users from "./users.schema.json" with { type: "json" };

export default function loadConfigSchema() {
    return {
        devices,
        events,
        floorplan,
        schedules,
        users,
    };
}
