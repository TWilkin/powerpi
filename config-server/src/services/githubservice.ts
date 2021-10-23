import GitHub, { GitHubOptions } from "github-api";
import { LoggerService, MqttService } from "powerpi-common";
import { Service } from "typedi";
import { sys } from "typescript";
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

  public async start() {
    await this.login();
  }

  private async login() {
    const options: GitHubOptions = {};

    try {
      if (this.config.gitHubUser) {
        this.logger.info(`Logging into GitHub as ${this.config.gitHubUser}`);
        options.username = this.config.gitHubUser;
        options.password = await this.config.gitHubPassword;
      } else {
        this.logger.info(`Logging into GitHub with token`);
        options.token = await this.config.gitHubToken;
      }
    } catch {
      // if we can't login to GitHub this service won't work
      sys.exit(1);
    }

    const github = new GitHub(options);
  }
}
