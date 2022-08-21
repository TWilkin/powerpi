import * as floorplan from "./floorplan.schema.json";
import * as users from "./users.schema.json";

export default function loadSchema() {
    return {
        floorplan,
        users,
    };
}
