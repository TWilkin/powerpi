import { LoggerService, MqttService } from "@powerpi/common";
import { Service } from "typedi";
import N3rgyData, { N3rgyDataPoint } from "../models/n3rgy";
import ConfigService from "./config";
import EnergyMonitorArgumentsService from "./EnergyMonitorArgumentService";
import N3rgyService, { EnergyType } from "./n3rgy";

@Service()
export default class EnergyMonitorService {
    private lastUpdate: {
        electricity?: Date;
        gas?: Date;
    };

    constructor(
        private readonly n3rgy: N3rgyService,
        private readonly mqtt: MqttService,
        private readonly config: ConfigService,
        private readonly args: EnergyMonitorArgumentsService,
        private readonly logger: LoggerService
    ) {
        this.lastUpdate = {};
    }

    public start() {
        const wrapper = async () => {
            const electricity = this.update(EnergyType.Electricity);
            const gas = this.update(EnergyType.Gas);

            await Promise.all([electricity, gas]);

            if (!this.args.options.daemon) {
                process.exit(1);
            }
        };

        wrapper();
    }

    private async update(energyType: EnergyType) {
        const start = this.lastUpdate[energyType] ?? this.defaultDate;
        const end = new Date();

        this.logger.info("Retrieving", energyType, "usage between", start, "and", end);

        const generator = getData(
            energyType === EnergyType.Electricity ? this.n3rgy.getElecticity : this.n3rgy.getGas,
            energyType,
            start,
            end,
            this.logger
        );

        let rows = 0;
        let result: IteratorResult<N3rgyData, void> | undefined;
        do {
            result = await generator.next();

            if (result.done) {
                break;
            }

            rows += result.value.values.length;

            // if we have outliers, remove them
            const threshold = this.config.maximumThreshold;
            if (threshold) {
                const originalLength = result.value.values.length;

                result.value.values = result.value.values.reduce((values, dataPoint) => {
                    if (dataPoint.value < threshold) {
                        values.push(dataPoint);
                    }
                    return values;
                }, [] as N3rgyDataPoint[]);

                const removed = originalLength - result.value.values.length;
                if (removed > 0) {
                    this.logger.warn(
                        "Removed",
                        removed,
                        "values greater than threshold of",
                        threshold
                    );
                }
            }

            const lastDate = await this.publishMessage(energyType, result.value);
            if (lastDate) {
                this.lastUpdate[energyType] = lastDate;
                this.logger.info("Received", energyType, "usage up to", lastDate);
            }
        } while (!result.done);

        if (this.args.options.daemon) {
            // schedule the next run either at the repeat interval or after the time the results usually arrive
            const nextRun = this.calculateNextRun(rows, this.lastUpdate[energyType]);
            this.logger.info("Retrieving", energyType, "usage again at", nextRun);
            setTimeout(() => this.update(energyType), nextRun.getTime() - new Date().getTime());
        }
    }

    private get defaultDate() {
        const date = new Date();
        date.setUTCMonth(date.getUTCMonth() - 13);

        const timestamp = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1, 0, 0, 0);

        return new Date(timestamp);
    }

    private calculateNextRun(rows: number, lastDate: Date | undefined) {
        const now = new Date();
        const oneDayAgo = new Date();
        oneDayAgo.setUTCDate(oneDayAgo.getUTCDate() - 1);

        if (rows > 1 && lastDate && lastDate >= oneDayAgo) {
            // there was data within the last day,
            // so use the time of the last record that was returned
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

    private async publishMessage(energyType: EnergyType, data: N3rgyData) {
        const writeDelay = this.config.messageWriteDelay;

        const messages = data.values
            .map((value) => ({
                value: value.value,
                unit: data.unit,
                timestamp: new Date(`${value.timestamp}Z`).getTime(),
            }))
            .sort((a, b) => a.timestamp - b.timestamp);

        let lastDate = 0;

        for (const message of messages) {
            this.mqtt.publish("event", energyType, "usage", message);

            lastDate = message.timestamp;

            // sleep for a moment so we don't overwhelm the queue
            await new Promise((resolve) => setTimeout(resolve, writeDelay));
        }

        this.logger.info("Published", messages.length, "message(s) to queue");

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
    logger.info("Split", energyType, "interval into", chunks.length - 1, "chunk(s)");

    try {
        for (let i = 1; i < chunks.length; i++) {
            const result = await func(chunks[i - 1], chunks[i]);

            logger.info("Received", result.values.length, energyType, "reading(s)");

            yield result;
        }
    } catch (error) {
        logger.error(error);
    }
}

function chunkDates(start: Date, end: Date) {
    const dates = [start];

    const current = new Date(start);
    do {
        current.setDate(current.getDate() + 90);
        dates.push(new Date(current));
    } while (current <= end);

    return dates;
}
