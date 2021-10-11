import { LoggerService, MqttService } from "powerpi-common";
import { Service } from "typedi";
import ConfigService from "./config";
import Container from "../container";

@Service()
export default class ScheduleExecutorService {
  private mqtt: MqttService;
  private logger: LoggerService;

  constructor(private config: ConfigService) {
    this.mqtt = Container.get(MqttService);
    this.logger = Container.get(LoggerService);
  }

  public async start() {
    // find the lights
    const lights = (await this.config.devices()).filter(
      (device) => device.type === "lifx_light"
    );
    this.logger.info(`Found ${lights.length} LIFX lights`);

    lights.forEach((light) =>
      this.logger.info(`Found LIFX light "${light.display_name ?? light.name}"`)
    );
  }
}
