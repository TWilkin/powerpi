import { LoggerService, MqttService } from "powerpi-common";
import { Service } from "typedi";
import Container from "../container";
import { N3rgyData } from "../models/n3rgy";
import ConfigService from "./config";
import N3rgyService, { EnergyType } from "./n3rgy";

@Service()
export default class EnergyMonitorService {
  private mqtt: MqttService;
  private logger: LoggerService;

  private lastUpdate: {
    electricity?: Date;
    gas?: Date;
  };

  constructor(private n3rgy: N3rgyService, private config: ConfigService) {
    this.mqtt = Container.get(MqttService);
    this.logger = Container.get(LoggerService);
    this.lastUpdate = {};
  }

  public start() {
    this.logger.info("Starting Energy Monitor");

    // as it's only just started force an update now
    this.update("electricity");
    this.update("gas");
  }

  private async update(energyType: EnergyType) {
    const start = this.lastUpdate[energyType] ?? this.defaultDate;
    const end = new Date();

    this.logger.info(
      `Retrieving ${energyType} usage between ${start} and ${end}.`
    );

    const generator = getData(
      energyType === "electricity"
        ? this.n3rgy.getElecticity
        : this.n3rgy.getGas,
      energyType,
      start,
      end,
      this.logger
    );

    let rows = 0;
    let result: IteratorResult<N3rgyData, void>;
    while (true) {
      result = await generator.next();

      if (result.done) {
        break;
      }

      rows += result.value.values.length;

      const lastDate = this.publishMessage(energyType, result.value);
      if (lastDate) {
        this.lastUpdate[energyType] = lastDate;
      }
    }

    // schedule the next run either at the repeat interval or after the time the results usually arrive
    const nextRun = this.calculateNextRun(rows, this.lastUpdate[energyType]);
    this.logger.info(`Retrieving ${energyType} usage again at ${nextRun}.`);
    setTimeout(
      () => this.update(energyType),
      nextRun.getTime() - new Date().getTime()
    );
  }

  private get defaultDate() {
    const date = new Date();
    date.setMonth(date.getMonth() - 13);

    const timestamp = Date.UTC(date.getFullYear(), date.getMonth(), 1, 0, 0, 0);

    return new Date(timestamp);
  }

  private calculateNextRun(rows: number, lastDate: Date | undefined) {
    const now = new Date();

    if (rows > 1 && lastDate) {
      // there was data, so use the time of the last record that was returned
      let timeout = new Date(now);
      timeout.setUTCHours(lastDate.getUTCHours());
      timeout.setUTCMinutes(lastDate.getMinutes());
      timeout = this.config.timeoutOffset.add(timeout);

      while (timeout <= this.config.retryInterval.next()) {
        // can't be in the past, or within interval so add a day
        timeout.setUTCDate(timeout.getUTCDate() + 1);
      }

      return timeout;
    }

    // no data so use the retry interval
    return this.config.retryInterval.next();
  }

  private publishMessage(energyType: EnergyType, data: N3rgyData) {
    const messages = data.values
      .map((value) => ({
        value: value.value,
        unit: data.unit,
        timestamp: new Date(`${value.timestamp}Z`).getTime()
      }))
      .sort((a, b) => a.timestamp - b.timestamp);

    let lastDate: number = 0;
    messages.forEach((message) => {
      this.mqtt.publish("event", energyType, "usage", message);

      lastDate = message.timestamp;
    });

    return lastDate > 0 ? new Date(lastDate) : undefined;
  }
}

async function* getData(
  func: (start: Date, end: Date) => Promise<N3rgyData>,
  energyType: EnergyType,
  start: Date,
  end: Date,
  logger: LoggerService
) {
  const chunks = chunkDates(start, end);
  logger.info(`Split interval into ${chunks.length - 1} 90 day chunk(s).`);

  try {
    for (let i = 1; i < chunks.length; i++) {
      const result = await func(chunks[i - 1], chunks[i]);

      logger.info(`Received ${result.values.length} ${energyType} reading(s).`);

      yield result;
    }
  } catch (error) {
    logger.error(error);
  }
}

function chunkDates(start: Date, end: Date) {
  let dates = [start];

  let current = new Date(start);
  do {
    current.setDate(current.getDate() + 90);
    dates.push(new Date(current));
  } while (current <= end);

  return dates;
}
