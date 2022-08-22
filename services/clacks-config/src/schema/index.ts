import loadCommonSchema from "./common";
import * as events from "./events.schema.json";
import * as floorplan from "./floorplan.schema.json";
import * as schedules from "./schedules.schema.json";
import * as users from "./users.schema.json";

export default function loadSchema() {
    return {
        // the common schema used by the config schema
        common: loadCommonSchema(),

        // the config schema
        config: {
            events,
            floorplan,
            schedules,
            users,
        },
    };
}
