import { DateTime } from "luxon";
import { Device, LoggerService, MqttService } from "powerpi-common";
import { Inject, Service, Token } from "typedi";
import Container from "../container";
import Schedule, { Weekday } from "../models/schedule";

interface DeviceScheduleConfig {
    device: Device;
    schedule: Schedule;
}

export const DeviceScheduleToken = new Token<DeviceScheduleConfig>("DEVICE_SCHEDULE_TOKEN");

@Service({ transient: true })
export default class DeviceSchedule {
    private mqtt: MqttService;
    private logger: LoggerService;

    private device: Device;
    private schedule: Schedule;

    constructor(@Inject(DeviceScheduleToken) config: DeviceScheduleConfig) {
        this.mqtt = Container.get(MqttService);
        this.logger = Container.get(LoggerService);

        this.device = config.device;
        this.schedule = config.schedule;
    }

    public async start() {
        this.logger.info(`Scheduling ${this.device.display_name ?? this.device.name}`);

        const startTime = this.toDate(this.schedule.between[0]);
        const endTime = this.toDate(this.schedule.between[1], startTime);

        this.logger.info(`${this.schedule.between[0]} => ${startTime}`);
        this.logger.info(`${this.schedule.between[1]} => ${endTime}`);
    }

    private toDate(input: string, after: DateTime = DateTime.local()) {
        // get the date in the local timezone
        const split = input.split(":").map((s) => Number.parseInt(s));
        const now = DateTime.local();
        let date = DateTime.local(now.year, now.month, now.day, split[0], split[1], split[2]);

        // check this date is after the specified date
        if (after >= date) {
            date = date.plus({ days: 1 });
        }

        // check this date is on the correct day of the week
        if (this.schedule.days) {
            const days = this.schedule.days.map((day) => parseInt(Weekday[day]));

            while (!days.includes(date.weekday)) {
                date = date.plus({ days: 1 });
            }
        }

        return date;
    }
}
