import * as DeviceState from "./DeviceState.schema.json";
import * as Identifier from "./Identifier.schema.json";
import * as Time from "./Time.schema.json";
import * as WeekDay from "./WeekDay.schema.json";

export default function loadCommonSchema() {
    return {
        DeviceState,
        Identifier,
        Time,
        WeekDay,
    };
}
