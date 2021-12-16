import { Service } from "typedi";
import { ConfigService } from "./config";
import { LoggerService } from "./logger";
import { Message, MqttConsumer, MqttService } from "./mqtt";

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

        // we have to wait until we get all the configs
        this.logger.info("Waiting for configuration from queue");
        const success = await this.waitForConfig();

        if (success) {
            this.logger.info("Retrieved all expected config from queue");
        } else if (this.config.configIsNeeded) {
            const error = "Failed to retrieve all expected config from queue";

            this.logger.error(error);

            throw error;
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

    private waitForConfig() {
        const interval = 1000;
        const waitTime = (this.config.configWaitTime * 1000) / interval;

        return new Promise<boolean>((resolve) => {
            let counter = 0;

            const check = () => {
                if (this.config.isPopulated) {
                    resolve(true);
                } else if (counter >= waitTime) {
                    resolve(false);
                } else {
                    counter++;
                    setTimeout(check, interval);
                }
            };

            check();
        });
    }
}
