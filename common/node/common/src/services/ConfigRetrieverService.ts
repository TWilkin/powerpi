import { Service } from "typedi";
import { sleep } from "../util/index.js";
import { ConfigFileType, ConfigService } from "./ConfigService.js";
import { LoggerService } from "./LoggerService.js";
import { Message, MqttConsumer, MqttService } from "./MqttService.js";

interface ConfigMessage extends Message {
    payload: object;
    checksum: string;
}

export interface ConfigChangeListener {
    /** Called when one of the ConfigFileTypes this listener is registered for is updated. */
    onConfigChange(type: ConfigFileType): void;
}

@Service()
export class ConfigRetrieverService implements MqttConsumer<ConfigMessage> {
    private static readonly topicType = "config";
    private static readonly topicAction = "change";

    private listeners: { [key in ConfigFileType]?: ConfigChangeListener[] };

    constructor(
        private readonly config: ConfigService,
        private readonly mqtt: MqttService,
        private readonly logger: LoggerService,
    ) {
        this.listeners = {};
    }

    /** Add a listener for changes to ConfigFileType `type`. */
    public addListener(type: ConfigFileType, listener: ConfigChangeListener) {
        if (!this.listeners[type]) {
            this.listeners[type] = [];
        }

        this.listeners[type]?.push(listener);
    }

    /** Remove an already registered listener from changes to ConfigFileType `type`. */
    public removeListener(type: ConfigFileType, listener: ConfigChangeListener) {
        this.listeners[type] = this.listeners[type]?.filter((l) => l !== listener);
    }

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
                    this,
                ),
            ),
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
        { payload, checksum }: ConfigMessage,
    ): void {
        const type = this.config.configFileTypes.find((type) => type.toLowerCase() == entity);
        if (type) {
            this.logger.info("Received config for", type);

            // this is a new config, so just set it
            this.config.setConfig(type, payload, checksum);

            // now notify the listeners if there are any
            this.listeners[type]?.forEach((listener) => listener.onConfigChange(type));
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
