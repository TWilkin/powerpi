import { Service } from "typedi";

export class Interval {
  years = 0;
  months = 0;
  days = 0;
  hours = 0;
  minutes = 0;
  seconds = 0;
  millis = 0;

  next() {
    return this.add(new Date());
  }

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

    const split = str.split(" ");

    let n: number | undefined = undefined;
    for (let i = 0; i < split.length; i++) {
      if (isNumber(split[i])) {
        n = parseFloat(split[i]);
      } else {
        if (!n) {
          n = 1;
        }

        switch (split[i]) {
          case "year":
          case "years":
            interval.years = n;
            break;

          case "month":
          case "months":
            interval.months = n;
            break;

          case "day":
          case "days":
            interval.days = n;
            break;

          case "hour":
          case "hours":
            interval.hours = n;
            break;

          case "minute":
          case "minutes":
            interval.minutes = n;
            break;

          case "second":
          case "seconds":
            interval.seconds = n;
            break;

          case "milli":
          case "millis":
            interval.millis = n;
            break;
        }

        n = undefined;
      }
    }

    return interval;
  }
}

function isNumber(n: string) {
  return !isNaN(parseFloat(n));
}
