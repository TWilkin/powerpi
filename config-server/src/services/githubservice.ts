import { Octokit } from "@octokit/rest";
import path from "path";
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

  public async start() {
    await this.checkForChanges();
  }

  private async checkForChanges() {
    const octokit = await this.login();

    const getFile = async (file: string) => {
      const filePath = path.join(this.config.path, file);

      this.logger.info(
        `Attempting to retrieve ${path.basename(
          file,
          ".json"
        )} file from github://${this.config.gitHubUser}/${
          this.config.repo
        }/${filePath}@${this.config.branch}`
      );

      const { data } = await octokit.rest.repos.getContent({
        owner: this.config.gitHubUser!,
        repo: this.config.repo,
        ref: this.config.branch,
        path: filePath
      });

      const { content } = data as { content: string };
      const buffer = Buffer.from(content, "base64");

      return JSON.parse(buffer.toString());
    };

    const devices = await getFile("devices.json");
    this.logger.info(JSON.stringify(devices));
  }

  private async login() {
    const token = await this.config.gitHubToken;

    return new Octokit({
      auth: token
    });
  }
}
