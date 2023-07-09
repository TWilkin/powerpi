import { LoggerService, MqttService } from "@powerpi/common";
import { Service } from "typedi";

@Service()
export default class HealthService {
    constructor(
        private readonly mqtt: MqttService,
        private readonly logger: LoggerService
    ) {}

    public execute() {
        // check we can access the message queue
        const mqtt = this.mqtt.connected;
        this.logger.debug("MQTT is ", mqtt ? "healthy" : "unhealthy");

        return mqtt;
    }
}
