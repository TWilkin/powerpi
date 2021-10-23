import { Octokit } from "@octokit/rest";
import path from "path";
import { LoggerService, MqttService } from "powerpi-common";
import { Service } from "typedi";
import Container from "../container";
import ConfigService from "./config";

const fileTypes = ["devices", "events", "schedules"];

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

    for (const type of fileTypes) {
      const file = await this.getFile(octokit, type);

      if (file) {
        this.logger.info(JSON.stringify(file));
      }
    }
  }

  private async login() {
    const token = await this.config.gitHubToken;

    return new Octokit({
      auth: token
    });
  }

  private async getFile(octokit: Octokit, fileType: string) {
    const filePath = path.join(this.config.path, `${fileType}.json`);

    this.logger.info(
      `Attempting to retrieve ${fileType} file from github://${this.config.gitHubUser}/${this.config.repo}/${filePath}@${this.config.branch}`
    );

    try {
      const { data } = await octokit.rest.repos.getContent({
        owner: this.config.gitHubUser!,
        repo: this.config.repo,
        ref: this.config.branch,
        path: filePath
      });

      const { content } = data as { content: string };
      const buffer = Buffer.from(content, "base64");

      return JSON.parse(buffer.toString());
    } catch {
      this.logger.error(`Could not retrieve ${fileType} file from GitHub`);
    }

    return undefined;
  }
}
