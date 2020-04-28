import Logger from 'loggy';

export interface Schedule {

    device: string;
    between: string[];
    interval: number;
    brightness: number[];
}

export class ScheduleExecutor {

    private schedule: Schedule;

    private interval?: NodeJS.Timeout;

    private brightnessDelta: number;

    private counter: number = 0;

    constructor(schedule: Schedule) {
        this.schedule = schedule;
        this.brightnessDelta = this.calculateIntervalDelta(schedule.brightness);
        Logger.info(this.toString());
    }

    // start the schedule running
    public run(): void {
        // set a timeout until the start time
        const localThis = this;
        const startTime = this.toDate(this.schedule.between[0]);
        setTimeout(() => localThis.start(), startTime.getTime() - new Date().getTime());
        Logger.info(`Scheduling to run again at ${startTime}`);
    }

    // start the interval
    private start(): void {
        // first execute the schedule
        this.counter = 1;
        this.execute();

        // then execute it for the next interval
        const localThis = this;
        this.interval = setInterval(() => localThis.execute(), this.schedule.interval * 1000);
    }

    // stop the interval
    private stop(): void {
        // clear the current interval
        clearTimeout(this.interval as NodeJS.Timeout);
        delete this.interval;

        // now schedule to run it again
        this.run();
    }

    private execute(): void {
        // check if the schedule should now stop
        const endTime = this.toDate(this.schedule.between[1], false);
        if(new Date() >= endTime) {
            this.stop();
            return;
        }
        
        Logger.info('Executing');

        // calculate the offsets
        let brightness = this.calculateNewValue(this.brightnessDelta, this.schedule.brightness);
        Logger.info(`Setting brightness of ${this.schedule.device} to ${brightness}`);

        // increment the counter
        this.counter++;
    }

    private toDate(input: string, future=true): Date {
        const split = input.split(':').map(s => Number.parseInt(s));
        const date = new Date();
        date.setHours(split[0], split[1], split[2], 0);

        // check this date is in the future
        if(future && new Date() > date) {
            date.setDate(date.getDate() + 1);
        }

        return date;
    }

    private calculateIntervalDelta(range: number[]): number {
        // work out how many ms the between time covers
        const startTime = this.toDate(this.schedule.between[0]);
        const endTime = this.toDate(this.schedule.between[1]);
        const ms = endTime.getTime() - startTime.getTime();

        // calculate how many intervals we have
        const interval = ms / (this.schedule.interval * 1000);

        // calculate the new value
        return (range[1] - range[0]) / interval
    }

    private calculateNewValue(delta: number, range: number[]): number {
        // calculate the new value with the delta
        let value = range[0] + delta * this.counter;

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
