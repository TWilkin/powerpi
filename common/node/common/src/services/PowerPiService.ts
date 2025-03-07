import { Service } from "typedi";
import { ConfigRetrieverService } from "./ConfigRetrieverService.js";
import { LoggerService } from "./LoggerService.js";
import { MqttService } from "./MqttService.js";

type AppStart = () => void | Promise<void>;

@Service()
export class PowerPiService {
    constructor(
        private readonly mqtt: MqttService,
        private readonly configRetriever: ConfigRetrieverService,
        private readonly logger: LoggerService,
    ) {}

    public async start(appStart: AppStart) {
        try {
            // start MQTT
            await this.mqtt.connect();

            // retrieve the config from the queue
            this.logger.info("Starting PowerPi Service");
            await this.configRetriever.start();

            // now the app is ready to start
            this.logger.info("Starting app");
            await appStart();
        } catch (e) {
            this.logger.error(e);

            await this.stop();

            process.exit(1);
        }
    }

    public async stop() {
        await this.mqtt.disconnect();
    }
}
