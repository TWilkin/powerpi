import { DateTime, Interval } from "luxon";
import { Device, LoggerService, MqttService, Schedule, Weekday } from "powerpi-common";
import { Inject, Service, Token } from "typedi";
import Container from "../container";

interface DeviceScheduleConfig {
    device: Device;
    schedule: Schedule;
}

export const DeviceScheduleToken = new Token<DeviceScheduleConfig>("DEVICE_SCHEDULE_TOKEN");

interface Delta {
    hue: number;
    saturation: number;
    brightness: number;
    kelvin: number;
}

@Service({ transient: true })
export default class DeviceSchedule {
    private mqtt: MqttService;
    private logger: LoggerService;

    private device: Device;
    private schedule: Schedule;

    private delta: Delta = {
        hue: 0,
        saturation: 0,
        brightness: 0,
        kelvin: 0,
    };

    constructor(@Inject(DeviceScheduleToken) config: DeviceScheduleConfig) {
        this.mqtt = Container.get(MqttService);
        this.logger = Container.get(LoggerService);

        this.device = config.device;
        this.schedule = config.schedule;

        Object.keys(this.delta).forEach((k: string) => {
            const key = k as keyof Delta;
            this.delta[key] = this.calculateIntervalDelta(this.schedule[key]);
        });
    }

    public start() {
        this.logger.info(this.toString());

        let interval: NodeJS.Timeout | null;

        const start = () => {
            // first execute the schedule
            this.execute();

            // then execute it for the next interval
            interval = setInterval(() => this.execute(), this.schedule.interval * 1000);
        };

        const stop = () => {
            // clear the current interval
            if (interval) {
                clearTimeout(interval);
                interval = null;
            }

            // ensure we run one last time to force it to the end of the range
            this.execute();

            // now schedule to run it again
            this.start();
        };

        const printSchedule = (type: string, time: DateTime) =>
            this.logger.info(
                `Scheduling to ${type} at ${time} (in ${Interval.fromDateTimes(DateTime.utc(), time)
                    .toDuration(["hours", "minutes", "seconds"])
                    .toFormat("hh:mm:ss")})`
            );

        // check if we're already within the time window
        let startTime = this.toDate(this.schedule.between[0]);
        let stopTime = this.toDate(this.schedule.between[1], startTime);
        const now = DateTime.utc();
        if (now >= startTime && now < stopTime) {
            // start the schedule running now
            start();
        } else {
            // set a timeout until the start time
            startTime = this.toDate(this.schedule.between[0], DateTime.utc());
            setTimeout(start, startTime.toMillis() - DateTime.utc().toMillis());
            printSchedule("start", startTime);
        }

        // set a timeout until the stop time
        stopTime = this.toDate(this.schedule.between[1], startTime);
        setTimeout(stop, stopTime.toMillis() - DateTime.utc().toMillis());
        printSchedule("stop", stopTime);
    }

    public toString(): string {
        let str = `Every ${this.schedule.interval}s between [${this.schedule.between}]`;

        // add the days
        if (this.schedule.days) {
            str += " on " + this.schedule.days.join(", ");
        } else {
            str += " every day";
        }

        str += ` adjust ${this.device.displayName}`;

        Object.keys(this.delta).forEach((k: string) => {
            const key = k as keyof Delta;
            if (this.schedule[key]) {
                str += ` ${key} between [${[this.schedule[key]]}]`;
            }
        });

        if (this.schedule.power) {
            str += " and turn it on";
        }

        return str;
    }

    private execute() {
        // what colour configuration should be set?
        const colour: Partial<Delta> = Object.keys(this.delta).reduce((acc, k) => {
            const key = k as keyof Delta;

            if (this.schedule[key]) {
                const newValue = this.calculateNewValue(this.delta[key], this.schedule[key]!);

                acc[key] = newValue;

                this.logger.info(`Setting ${key} of ${this.device.displayName} to ${newValue}`);
            }

            return acc;
        }, {} as Partial<Delta>);

        // do we want to turn it on/off?
        const state =
            this.schedule.power === true ? "on" : this.schedule.power === false ? "off" : undefined;
        if (state) {
            this.logger.info(`Setting power of ${this.device.displayName} to ${state}`);
        }

        const message = { state, colour };
        this.mqtt.publish("device", this.device.name, "change", message);
    }

    private toDate(input: string, after?: DateTime) {
        // get the date in the local timezone
        const split = input.split(":").map((s) => Number.parseInt(s));
        const now = DateTime.local();
        let date = DateTime.local(now.year, now.month, now.day, split[0], split[1], split[2]);

        // check this date is after the specified date
        if (after && after >= date.toUTC()) {
            date = date.plus({ days: 1 });
        }

        // check this date is on the correct day of the week
        if (this.schedule.days) {
            const days = this.schedule.days.map((day) => parseInt(Weekday[day]));

            while (!days.includes(date.weekday)) {
                date = date.plus({ days: 1 });
            }
        }

        return date.toUTC();
    }

    private calculateIntervalDelta(range?: number[]): number {
        if (!range) {
            return 0;
        }

        // work out how many ms the between time covers
        const startTime = this.toDate(this.schedule.between[0]);
        const endTime = this.toDate(this.schedule.between[1], startTime);
        const ms = endTime.toMillis() - startTime.toMillis();

        // calculate how many intervals we have
        const interval = ms / (this.schedule.interval * 1000);

        // calculate the new value
        return (range[1] - range[0]) / interval;
    }

    private calculateNewValue(delta: number, range: number[]) {
        // calculate the number of times this has run thus far
        const startTime = this.toDate(this.schedule.between[0]);
        const diff = (DateTime.utc().toMillis() - startTime.toMillis()) / 1000;
        const counter = diff / this.schedule.interval;

        // calculate the new value with the delta
        let value = range[0] + delta * counter;

        // ensure it's constrained by the end range
        if (delta > 0) {
            value = Math.min(value, range[1]);
        } else {
            value = Math.max(value, range[1]);
        }

        return value;
    }
}
