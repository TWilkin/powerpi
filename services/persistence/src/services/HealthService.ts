import { FileService, LoggerService, MqttService } from "@powerpi/common";
import { Service } from "typedi";
import Container from "../Container";
import ConfigService from "./ConfigService";
import DbService from "./DbService";

@Service()
export default class HealthService {
    private readonly config: ConfigService;
    private readonly db: DbService;
    private readonly mqtt: MqttService;
    private readonly fs: FileService;
    private readonly logger: LoggerService;

    constructor() {
        this.config = Container.get(ConfigService);
        this.db = Container.get(DbService);
        this.mqtt = Container.get(MqttService);
        this.fs = Container.get(FileService);
        this.logger = Container.get(LoggerService);
    }

    public async start(interval = 10) {
        await this.execute();

        setInterval(() => this.execute(), interval * 1000);
    }

    private async execute() {
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
