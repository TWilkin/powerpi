import { LoggerService, MqttService } from "powerpi-common";
import { Service } from "typedi";
import Container from "../container";
import { N3rgyData } from "../models/n3rgy";
import N3rgyService, { EnergyType } from "./n3rgy";

@Service()
export default class EnergyMonitorService {
  private updateFrequency = 12 * 60 * 60 * 1000;

  private mqtt: MqttService;
  private logger: LoggerService;

  private lastUpdate: {
    electricity?: Date;
    gas?: Date;
  };

  constructor(private n3rgy: N3rgyService) {
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

    let result: IteratorResult<N3rgyData, void>;
    while (true) {
      result = await generator.next();

      if (result.done) {
        break;
      }

      const lastDate = this.publishMessage(energyType, result.value);
      if (lastDate) {
        this.lastUpdate[energyType] = lastDate;
      }
    }

    // schedule the next run
    this.logger.info(
      `Retrieving ${energyType} usage again in ${this.updateFrequency}ms.`
    );
    setTimeout(() => this.update(energyType), 10 * 1000);
  }

  private get defaultDate() {
    const date = new Date();
    date.setMonth(date.getMonth() - 13);

    const timestamp = Date.UTC(date.getFullYear(), date.getMonth(), 1, 0, 0, 0);

    return new Date(timestamp);
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
      this.logger.info(JSON.stringify(message));

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

      logger.info(`Received ${result.values.length} ${energyType} readings.`);

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
