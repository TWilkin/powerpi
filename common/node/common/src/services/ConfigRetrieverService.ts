import { Service } from "typedi";
import { sleep } from "../util";
import { ConfigService } from "./ConfigService";
import { LoggerService } from "./LoggerService";
import { Message, MqttConsumer, MqttService } from "./MqttService";

interface ConfigMessage extends Message {
    payload: object;
    checksum: string;
}

@Service()
export class ConfigRetrieverService implements MqttConsumer<ConfigMessage> {
    private static readonly topicType = "config";
    private static readonly topicAction = "change";

    constructor(
        private config: ConfigService,
        private mqtt: MqttService,
        private logger: LoggerService
    ) {}

    public async start() {
        if (this.config.configIsNeeded) {
            this.logger.info("Waiting for configuration from queue");
        }

        // subscribe to change topic for each device type
        await Promise.all(
            this.config.configFileTypes.map((type) =>
                this.mqtt.subscribe(
                    ConfigRetrieverService.topicType,
                    type.toLowerCase(),
                    ConfigRetrieverService.topicAction,
                    this
                )
            )
        );

        // we have to wait until we get all the configs we're waiting for
        if (this.config.configIsNeeded) {
            const success = await this.waitForConfig();

            if (success) {
                this.logger.info("Retrieved all expected config from queue");
            } else {
                throw new Error("Failed to retrieve all expected config from queue");
            }
        }
    }

    public message(
        _: string,
        entity: string,
        __: string,
        { payload, checksum }: ConfigMessage
    ): void {
        const type = this.config.configFileTypes.find((type) => type.toLowerCase() == entity);
        if (type) {
            this.logger.info("Received config for", type);

            if (
                this.config.configIsNeeded &&
                this.config.getUsedConfig().find((config) => config === type) &&
                this.config.getConfig(type)?.data
            ) {
                // this is a changed config and used, so we should restart the service
                this.logger.info("Restarting service due to changed", type, "config");
                process.exit(0);
            } else {
                // this is a new config, so just set it
                this.config.setConfig(type, payload, checksum);
            }
        }
    }

    private async waitForConfig() {
        const interval = 1000;
        const waitTime = (this.config.configWaitTime * 1000) / interval;

        let counter = 0;
        while (counter < waitTime) {
            if (this.config.isPopulated) {
                return true;
            }

            counter++;

            await sleep(interval);
        }

        return false;
    }
}
