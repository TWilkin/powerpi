import { Service } from "typedi";
import { ConfigRetrieverService } from "./configretriever";
import { LoggerService } from "./logger";
import { MqttService } from "./mqtt";

type AppStart = () => void | Promise<void>;

@Service()
export class PowerPiService {
    constructor(
        private mqtt: MqttService,
        private config: ConfigRetrieverService,
        private logger: LoggerService
    ) {}

    public async start(appStart: AppStart) {
        try {
            // start MQTT
            await this.mqtt.connect();

            // retrieve the config from the queue
            this.logger.info("Starting PowerPi Service");
            await this.config.start();

            // now the app is ready to start
            this.logger.info("Starting app");
            await appStart();
        } catch (e) {
            this.logger.error(e);

            await this.mqtt.disconnect();

            process.exit(1);
        }
    }
}
