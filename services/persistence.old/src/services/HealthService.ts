import { FileService, LoggerService, MqttService } from "@powerpi/common";
import { Service } from "typedi";
import ConfigService from "./ConfigService.js";
import DbService from "./DbService.js";

@Service()
export default class HealthService {
    constructor(
        private readonly config: ConfigService,
        private readonly fs: FileService,
        private readonly db: DbService,
        private readonly mqtt: MqttService,
        private readonly logger: LoggerService,
    ) {}

    public async start(interval = 10) {
        await this.execute();

        setInterval(() => this.execute(), interval * 1000);
    }

    public async execute() {
        // check we can access the message queue
        const mqtt = this.mqtt.connected;
        this.logger.debug("MQTT is ", mqtt ? "healthy" : "unhealthy");

        // check we can access the database
        const db = await this.db.isAlive();
        this.logger.debug("Database is ", db ? "healthy" : "unhealthy");

        if (mqtt && db) {
            await this.fs.touch(this.config.healthCheckFile);
        }
    }
}
