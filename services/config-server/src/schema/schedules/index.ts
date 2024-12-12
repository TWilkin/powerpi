import * as DeviceInternalSchedule from "./DeviceIntervalSchedule.json";
import * as DeviceSchedule from "./DeviceSchedule.json";

export default function loadSchedulesSchema() {
    return {
        // the base device schedule
        DeviceSchedule,

        // the device schedules
        DeviceInternalSchedule,
    };
}
