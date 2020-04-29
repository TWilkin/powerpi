import Lifx from 'node-lifx-lan';
import Logger from 'loggy';
import moment from 'moment-timezone';

export interface Schedule {

    device: string;
    between: string[];
    interval: number;
    brightness: number[];
}

export class ScheduleExecutor {

    private schedule: Schedule;

    private timezone: string;

    private light: Lifx.LifxLanDevice;

    private interval?: NodeJS.Timeout;

    private brightnessDelta: number;

    constructor(schedule: Schedule, timezone: string, light: Lifx.LifxLanDevice) {
        this.schedule = schedule;
        this.timezone = timezone;
        this.light = light;

        this.brightnessDelta = this.calculateIntervalDelta(schedule.brightness);
        Logger.info(this.toString());
    }

    // start the schedule running
    public run(): void {
        const localThis = this;

        // check if we're already within the time window
        let startTime = this.toDate(this.schedule.between[0], null);
        let stopTime = this.toDate(this.schedule.between[1], startTime);
        let now = new Date();
        if(now >= startTime && now < stopTime) {
            // start the schedule running now
            this.start();
        } else {
            // set a timeout until the start time
            startTime = this.toDate(this.schedule.between[0]);
            setTimeout(() => localThis.start(), startTime.getTime() - new Date().getTime());
            Logger.info(`Scheduling to start at ${startTime}`);
        }

        // set a timeout until the stop time
        stopTime = this.toDate(this.schedule.between[1], startTime);
        setTimeout(() => localThis.stop(), stopTime.getTime() - new Date().getTime());
        Logger.info(`Scheduling to stop at ${stopTime}`);
    }

    // start the interval
    private start(): void {
        // first execute the schedule
        this.execute();

        // then execute it for the next interval
        const localThis = this;
        this.interval = setInterval(() => localThis.execute(), this.schedule.interval * 1000);
    }

    // stop the interval
    private stop(): void {
        // clear the current interval
        if(this.interval) {
            clearTimeout(this.interval as NodeJS.Timeout);
            delete this.interval;
        }

        // ensure we run one last time to force it to the end of the range
        this.execute();

        // now schedule to run it again
        this.run();
    }

    private execute(): void {
        // calculate the offsets
        let brightness = this.calculateNewValue(this.brightnessDelta, this.schedule.brightness);
        Logger.info(`Setting brightness of ${this.schedule.device} to ${brightness}`);

        // update the device
        this.light.lightSetColor({
            color: {
                hue: 0,
                saturation: 0,
                brightness: brightness,
                kelvin: 2700
            }
        });
    }

    private toDate(input: string, after: Date | null = new Date()): Date {
        const split = input.split(':').map(s => Number.parseInt(s));
        const date = new Date();
        date.setUTCHours(split[0], split[1], split[2]);

        // now add the timezone offset
        const momentDate = moment.tz(date, this.timezone);
        date.setTime(date.getTime() - momentDate.utcOffset() * 60 * 1000);

        // check this date is after the specified date
        if(after && after >= date) {
            date.setDate(date.getDate() + 1);
        }

        return date;
    }

    private calculateIntervalDelta(range: number[]): number {
        // work out how many ms the between time covers
        const startTime = this.toDate(this.schedule.between[0], null);
        const endTime = this.toDate(this.schedule.between[1], startTime);
        const ms = endTime.getTime() - startTime.getTime();

        // calculate how many intervals we have
        const interval = ms / (this.schedule.interval * 1000);

        // calculate the new value
        return (range[1] - range[0]) / interval
    }

    private calculateNewValue(delta: number, range: number[]): number {
        // calculate the number of times this has run thus far
        const startTime = this.toDate(this.schedule.between[0], null);
        const diff = (new Date().getTime() - startTime.getTime()) / 1000;
        const counter = diff / this.schedule.interval;

        // calculate the new value with the delta
        let value = range[0] + delta * counter;

        // ensure it's constrained by the end range
        if(delta > 0) {
            value = Math.min(value, range[1]);
        } else {
            value = Math.max(value, range[1]);
        }

        return value;
    }

    public toString(): string {
        return `Every ${this.schedule.interval}s between [${this.schedule.between}]
                adjust ${this.schedule.device} 
                brightness between [${this.schedule.brightness}]`;
    }

}
