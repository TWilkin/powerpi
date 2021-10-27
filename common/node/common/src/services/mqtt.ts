import { AsyncMqttClient, connectAsync, IClientPublishOptions } from "async-mqtt";
import os from "os";
import { Service } from "typedi";
import { ConfigService } from "./config";
import { LoggerService } from "./logger";

export interface Message {
    [key: string]: any;
    timestamp?: number;
}

@Service()
export class MqttService {
    private client: AsyncMqttClient | undefined;

    constructor(private config: ConfigService, private logger: LoggerService) {}

    private get clientId() {
        return `${this.config.service}-${os.hostname}`;
    }

    public async connect() {
        const options = {
            clientId: this.clientId,
        };

        this.logger.info("MQTT connecting to", this.config.mqttAddress);
        this.client = await connectAsync(this.config.mqttAddress, options);
        this.logger.info("MQTT client", options.clientId, "connected.");
    }

    public async disconnect() {
        if (this.client) {
            await this.client.end();
            this.logger.info("MQTT client", this.clientId, "disconnected.");
        }
    }

    public async publish(type: string, entity: string, action: string, message: Message) {
        if (!message.timestamp) {
            message.timestamp = new Date().getTime();
        }

        const options: IClientPublishOptions = {
            qos: 2,
            retain: true,
        };

        const topicName = this.topicName(type, entity, action);

        this.logger.debug("Publishing to", topicName);

        await this.client?.publish(topicName, JSON.stringify(message), options);
    }

    private topicName = (type: string, entity: string, action: string) =>
        `${this.config.topicNameBase}/${type}/${entity}/${action}`;
}
