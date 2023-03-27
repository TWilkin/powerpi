import { FileService, LoggerService, MqttService } from "@powerpi/common";
import { Service } from "typedi";
import ConfigService from "./ConfigService";
import DbService from "./DbService";

@Service()
export default class HealthService {
    constructor(
        private readonly configService: ConfigService,
        private readonly dbService: DbService,
        private readonly mqttService: MqttService,
        private readonly fs: FileService,
        private readonly logger: LoggerService
    ) {}

    public async start(interval = 10) {
        await this.execute();

        setInterval(this.execute, interval * 1000);
    }

    private async execute() {
        // check we can access the message queue
        const mqtt = this.mqttService.connected;
        this.logger.debug("MQTT is ", mqtt ? "healthy" : "unhealthy");

        // check we can access the database
        const db = await this.dbService.isAlive();
        this.logger.debug("Database is ", db ? "healthy" : "unhealthy");

        if (mqtt && db) {
            await this.fs.touch(this.configService.healthCheckFile);
        }
    }
}
