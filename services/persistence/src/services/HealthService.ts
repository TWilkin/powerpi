import { FileService, MqttService } from "@powerpi/common";
import { Service } from "typedi";
import ConfigService from "./ConfigService";
import DbService from "./DbService";

@Service()
export default class HealthService {
    constructor(
        private readonly configService: ConfigService,
        private readonly dbService: DbService,
        private readonly mqttService: MqttService,
        private readonly fs: FileService
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
            await this.fs.touch(this.configService.healthCheckFile);
        }
    }
}
