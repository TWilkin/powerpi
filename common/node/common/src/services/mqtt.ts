import { AsyncMqttClient, connectAsync, IClientPublishOptions } from "async-mqtt";
import os from "os";
import { Service } from "typedi";
import { ConfigService } from "./config";
import { LoggerService } from "./logger";

export interface Message {
    [key: string]: any;
    timestamp?: number;
}

export interface MqttConsumer {
    message(type: string, entity: string, action: string, message: Message): void;
}

@Service()
export class MqttService {
    private client: AsyncMqttClient | undefined;

    private consumers: { [key: string]: MqttConsumer[] };

    constructor(private config: ConfigService, private logger: LoggerService) {
        this.consumers = {};
    }

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

        this.client.on("error", (error) => {
            this.logger.error("MQTT client error:", error);
            process.exit(1);
        });

        this.client.on("message", (topic: string, message: Buffer) => {
            const str = message.toString();

            this.logger.debug("Received:", topic, ": ", str);

            const consumers = (this.consumers["#"] ?? []).concat(this.consumers[topic] ?? []);

            if (consumers.length > 0) {
                const [_, type, entity, action] = topic.split("/");

                const data = JSON.parse(str);

                consumers.forEach((consumer) => consumer.message(type, entity, action, data));
            }
        });
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

    public async subscribe(
        type: string,
        entity: string,
        action: string,
        consumer: MqttConsumer
    ): Promise<void>;
    public async subscribe(consumer: MqttConsumer): Promise<void>;
    public async subscribe(
        a: string | MqttConsumer,
        b?: string,
        c?: string,
        d?: MqttConsumer
    ): Promise<void> {
        const consumer = d ?? (a as MqttConsumer);
        const topic = b ? this.topicName(a as string, b, c!) : "#";

        this.logger.debug("Subscribing to topic", topic);

        if (!this.consumers[topic]) {
            this.consumers[topic] = [];
        }
        this.consumers[topic].push(consumer);

        await this.client?.subscribe(topic);
    }

    public async unsubscribe(
        type: string,
        entity: string,
        action: string,
        consumer: MqttConsumer
    ): Promise<void>;
    public async unsubscribe(consumer: MqttConsumer): Promise<void>;
    public async unsubscribe(
        a: string | MqttConsumer,
        b?: string,
        c?: string,
        d?: MqttConsumer
    ): Promise<void> {
        const consumer = d ?? (a as MqttConsumer);
        const topic = b ? this.topicName(a as string, b, c!) : "#";

        this.logger.debug("Unsubscribing from topic", topic);

        this.consumers[topic] = this.consumers[topic]?.filter((c) => c !== consumer);

        await this.client?.unsubscribe(topic);
    }

    private topicName = (type: string, entity: string, action: string) =>
        `${this.config.topicNameBase}/${type}/${entity}/${action}`;
}
