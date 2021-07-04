import { connect, IClientPublishOptions, MqttClient } from "mqtt";
import os from "os";
import { Service } from "typedi";
import ConfigService from "./config";
import LoggerService from "./logger";

export interface Message {
  [key: string]: any;
  timestamp?: number;
}

@Service()
export default class MqttService {
  private client: MqttClient | undefined;

  constructor(private config: ConfigService, private logger: LoggerService) {}

  public connect() {
    const options = {
      clientId: `${this.config.service}-${os.hostname}`
    };

    this.logger.info(`MQTT connecting to ${this.config.mqttAddress}`);
    this.client = connect(this.config.mqttAddress, options);

    this.client.on("connect", () => {
      this.logger.info(`MQTT client ${options.clientId} connected.`);
    });

    this.client.on("error", (error) => {
      this.logger.error(`MQTT client error: ${error}`);
      process.exit(1);
    });
  }

  public publish(
    type: string,
    entity: string,
    action: string,
    message: Message
  ) {
    if (!message.timestamp) {
      message.timestamp = new Date().getTime();
    }

    const options: IClientPublishOptions = {
      qos: 2,
      retain: true
    };

    const topicName = this.topicName(type, entity, action);

    this.logger.info(`Publishing to ${topicName}.`);

    this.client?.publish(topicName, JSON.stringify(message), options);
  }

  private topicName(type: string, entity: string, action: string) {
    return `${this.config.topicNameBase}/${type}/${entity}/${action}`;
  }
}
