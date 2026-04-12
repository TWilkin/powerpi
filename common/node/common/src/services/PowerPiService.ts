import { Service } from "typedi";
import { LoggerService } from "./LoggerService.js";
import { MqttService } from "./MqttService.js";

type AppStart = () => void | Promise<void>;

type Options = {
    mqtt?: boolean;
};

@Service()
export class PowerPiService {
    private useMQTT: boolean = true;

    constructor(
        private readonly mqtt: MqttService,
        private readonly logger: LoggerService,
    ) {}

    public async start(appStart: AppStart, { mqtt = true }: Options = {}) {
        this.useMQTT = mqtt;

        try {
            // start MQTT
            if (mqtt) {
                await this.mqtt.connect();
            }

            // retrieve the config from the queue
            this.logger.info("Starting PowerPi Service");

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
        if (this.useMQTT) {
            await this.mqtt.disconnect();
        }
    }
}
