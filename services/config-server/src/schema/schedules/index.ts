import * as DeviceInternalSchedule from "./DeviceIntervalSchedule.json" with { type: "json" };
import * as DeviceSchedule from "./DeviceSchedule.json" with { type: "json" };
import * as DeviceSingleSchedule from "./DeviceSingleSchedule.json" with { type: "json" };

export default function loadSchedulesSchema() {
    return {
        // the base device schedule
        DeviceSchedule,

        // the device schedules
        DeviceInternalSchedule,
        DeviceSingleSchedule,
    };
}
