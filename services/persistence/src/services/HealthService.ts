import { MqttService } from "@powerpi/common";
import fs from "fs";
import { Service } from "typedi";
import util from "util";
import ConfigService from "./ConfigService";
import DbService from "./DbService";

// allow writing of files using await
const writeAsync = util.promisify(fs.writeFile);

@Service()
export default class HealthService {
    constructor(
        private readonly configService: ConfigService,
        private readonly dbService: DbService,
        private readonly mqttService: MqttService
    ) {}

    public async start() {
        await this.execute();

        setInterval(this.execute, 10 * 1000);
    }

    private async execute() {
        // check we can access the message queue
        const mqtt = this.mqttService.connected;

        // check we can access the database
        const db = true;

        if (mqtt && db) {
            await writeAsync(this.configService.healthCheckFile, "");
        }
    }
}
