import * as Condition from "./Condition.schema.json";
import * as DeviceState from "./DeviceState.schema.json";
import * as Identifier from "./Identifier.schema.json";
import * as JsonPath from "./JsonPatch.schema.json";
import * as Mac from "./MAC.schema.json";
import * as Time from "./Time.schema.json";
import * as WeekDay from "./WeekDay.schema.json";

export default function loadCommonSchema() {
    return {
        Condition,
        DeviceState,
        Identifier,
        JsonPath,
        Mac,
        Time,
        WeekDay,
    };
}
