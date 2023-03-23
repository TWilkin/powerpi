import { AsyncMqttClient, connectAsync, IClientPublishOptions } from "async-mqtt";
import os from "os";
import { Service } from "typedi";
import { ConfigService } from "./config";
import { LoggerService } from "./logger";

export interface Message {
    timestamp?: number;
}

export type OutgoingMessage = Omit<Message, "timestamp">;

export interface MqttConsumer<TMessage extends Message = Message> {
    message(type: string, entity: string, action: string, message: TMessage): void;
}

@Service()
export class MqttService {
    private client: AsyncMqttClient | undefined;

    private consumers: { [key: string]: MqttConsumer[] };

    constructor(private config: ConfigService, private logger: LoggerService) {
        this.consumers = {};
    }

    public get connected() {
        return this.client?.connected ?? false;
    }

    private get clientId() {
        const prefix = this.config.service.indexOf("/")
            ? this.config.service.split("/").slice(-1)[0]
            : this.config.service;

        return `${prefix}-${os.hostname}`;
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

            // find the keys that need RegExp
            const matches = Object.keys(this.consumers)
                .map((key) => ({ key: key, regex: this.topicRegex(key) }))
                .filter((obj) => obj.regex)
                .filter((obj) => obj.regex?.test(topic))
                .map((obj) => obj.key);

            // append the base consumers, the specific topic consumers, and any regex match consumers
            const consumers = (this.consumers[this.topicName()] ?? [])
                .concat(this.consumers[topic] ?? [])
                .concat(
                    matches.reduce(
                        (acc, match) => acc.concat(this.consumers[match]),
                        [] as MqttConsumer[]
                    )
                );

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

    public async publish(type: string, entity: string, action: string, message: OutgoingMessage) {
        const json = JSON.stringify({
            timestamp: new Date().getTime(),
            ...message,
        });

        const options: IClientPublishOptions = {
            qos: 2,
            retain: true,
        };

        const topicName = this.topicName(type, entity, action);

        this.logger.debug("Publishing to", topicName);

        await this.client?.publish(topicName, json, options);
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
        const topic = typeof a === "string" && b && c ? this.topicName(a, b, c) : this.topicName();

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
        const topic = typeof a === "string" && b && c ? this.topicName(a, b, c) : this.topicName();

        this.logger.debug("Unsubscribing from topic", topic);

        this.consumers[topic] = this.consumers[topic]?.filter((c) => c !== consumer);

        await this.client?.unsubscribe(topic);
    }

    private topicName(type: string, entity: string, action: string): string;
    private topicName(): string;
    private topicName(type?: string, entity?: string, action?: string): string {
        if (type && entity && action) {
            return `${this.config.topicNameBase}/${type}/${entity}/${action}`;
        }

        return `${this.config.topicNameBase}/#`;
    }

    private topicRegex(str: string) {
        if (str.indexOf("+") >= 0) {
            // this needs converting
            str = str.replace("+", ".*");

            return new RegExp(`^${str}$`);
        }

        return undefined;
    }
}
