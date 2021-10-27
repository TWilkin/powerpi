import { Service } from "typedi";
import { ConfigService } from "./config";
import { LoggerService } from "./logger";
import { Message, MqttConsumer, MqttService } from "./mqtt";

interface ConfigMessage extends Message {
    payload: object;
}

@Service()
export class ConfigRetrieverService implements MqttConsumer {
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
        const success = await waitForCondition(() => this.config.isPopulated);

        if (success) {
            this.logger.info("Retrieved all expected config from queue");
        } else {
            const error = "Failed to retrieve all expected config from queue";

            this.logger.error(error);

            throw error;
        }
    }

    public message(_: string, entity: string, __: string, { payload }: ConfigMessage): void {
        const type = this.config.configFileTypes.find((type) => type.toLowerCase() == entity);
        if (type) {
            this.logger.info("Received config for", type);

            if (
                this.config.getUsedConfig().find((config) => config === type) &&
                this.config.getConfig(type)
            ) {
                // this is a changed config and used, so we should restart the service
                this.logger.info("Restarting service due to changed", type, "config");
                process.exit(0);
            } else {
                // this is a new config, so just set it
                this.config.setConfig(type, payload);
            }
        }
    }
}

function waitForCondition(condition: () => boolean, maxTries = 3) {
    return new Promise<boolean>((resolve) => {
        let counter = 0;

        const check = () => {
            if (condition()) {
                resolve(true);
            } else if (counter >= maxTries) {
                resolve(false);
            } else {
                counter++;
                setTimeout(check, 1000);
            }
        };

        check();
    });
}
