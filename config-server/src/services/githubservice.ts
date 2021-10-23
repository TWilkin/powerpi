import { LoggerService, MqttService } from "powerpi-common";
import { Service } from "typedi";
import Container from "../container";
import ConfigService from "./config";

@Service()
export default class GitHubConfigService {
  private mqtt: MqttService;
  private logger: LoggerService;

  constructor(private config: ConfigService) {
    this.mqtt = Container.get(MqttService);
    this.logger = Container.get(LoggerService);
  }

  public start() {}
}
