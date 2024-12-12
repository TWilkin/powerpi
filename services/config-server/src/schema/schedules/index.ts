import * as DeviceInternalSchedule from "./DeviceIntervalSchedule.json";
import * as DeviceSchedule from "./DeviceSchedule.json";
import * as DeviceSingleSchedule from "./DeviceSingleSchedule.json";

export default function loadSchedulesSchema() {
    return {
        // the base device schedule
        DeviceSchedule,

        // the device schedules
        DeviceInternalSchedule,
        DeviceSingleSchedule,
    };
}
