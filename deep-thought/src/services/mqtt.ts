import { $log, OnInit, Service } from "@tsed/common";
import { connect, IClientPublishOptions, MqttClient } from "mqtt";
import os from "os";
import Config from "./config";

export interface MqttListener extends OnInit {
    topicMatcher: RegExp;

    onMessage(topic: string, message: any): void;
}

@Service()
export default class MqttService {
    private client: MqttClient | undefined;

    private listeners: MqttListener[];

    private topics: string[];

    constructor(private readonly config: Config) {
        this.client = undefined;
        this.listeners = [];
        this.topics = [];
    }

    public publish(topic: string, message: any) {
        this.connect();

        const options: IClientPublishOptions = {
            qos: 2,
            retain: true,
        };

        message.timestamp = new Date().getTime();

        this.client?.publish(topic, JSON.stringify(message), options);
    }

    public subscribe(topic: string, listener: MqttListener) {
        this.connect();

        this.topics.push(topic);
        this.listeners.push(listener);
    }

    private connect() {
        if (!this.client) {
            const localThis = this;

            const options = {
                clientId: `api-${os.hostname}`,
            };

            this.client = connect(this.config.mqttAddress, options);

            this.topics.forEach((topic) => localThis.client?.subscribe(topic));

            this.client.on("connect", () => {
                $log.info(`MQTT client ${options.clientId} connected.`);
            });

            this.client.on("error", (error) => {
                $log.error(`MQTT client error: ${error}`);
                process.exit(1);
            });

            this.client.on("message", (topic, message) => {
                $log.info(`MQTT received (${topic}):(${message.toString()})`);

                const json = JSON.parse(message.toString());

                this.listeners
                    .filter((listener) => listener.topicMatcher.test(topic))
                    .forEach((listener) => listener.onMessage(topic, json));
            });
        }
    }
}
