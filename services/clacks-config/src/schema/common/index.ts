import * as DeviceName from "./DeviceName.schema.json";
import * as Time from "./Time.schema.json";
import * as WeekDay from "./WeekDay.schema.json";

export default function loadCommonSchema() {
    return {
        DeviceName,
        Time,
        WeekDay,
    };
}
