import { Service } from "typedi";

export class Interval {
    years = 0;
    months = 0;
    days = 0;
    hours = 0;
    minutes = 0;
    seconds = 0;
    millis = 0;

    next = () => this.add(new Date());

    add(date: Date) {
        const timeout = new Date(date);

        timeout.setUTCFullYear(timeout.getUTCFullYear() + this.years);
        timeout.setUTCMonth(timeout.getUTCMonth() + this.months);
        timeout.setUTCDate(timeout.getUTCDate() + this.days);
        timeout.setUTCHours(timeout.getUTCHours() + this.hours);
        timeout.setUTCMinutes(timeout.getUTCMinutes() + this.minutes);
        timeout.setUTCSeconds(timeout.getUTCSeconds() + this.seconds);
        timeout.setUTCMilliseconds(timeout.getUTCMilliseconds() + this.millis);

        return timeout;
    }
}

@Service()
export class IntervalParserService {
    public parse(str: string) {
        const interval = new Interval();

        str = str.replace(/,/g, "").toLowerCase();
        const split = str.split(" ");

        let value: number | undefined = undefined;
        for (let i = 0; i < split.length; i++) {
            const asFloat = parseFloat(split[i]);
            if (!isNaN(asFloat)) {
                value = asFloat;
            } else {
                const currentValue = value ?? 1;
                switch (split[i]) {
                    case "year":
                    case "years":
                        interval.years = currentValue;
                        break;

                    case "month":
                    case "months":
                        interval.months = currentValue;
                        break;

                    case "day":
                    case "days":
                        interval.days = currentValue;
                        break;

                    case "hour":
                    case "hours":
                    case "h":
                        interval.hours = currentValue;
                        break;

                    case "minute":
                    case "minutes":
                    case "m":
                        interval.minutes = currentValue;
                        break;

                    case "second":
                    case "seconds":
                    case "s":
                        interval.seconds = currentValue;
                        break;

                    case "millisecond":
                    case "milliseconds":
                    case "milli":
                    case "millis":
                    case "ms":
                        interval.millis = currentValue;
                        break;

                    case "a":
                    case "an":
                        value = 1;
                        break;
                }

                value = undefined;
            }
        }

        return interval;
    }
}
