import { Octokit } from "@octokit/rest";
import path from "path";
import { ConfigFileType, LoggerService, MqttService } from "powerpi-common";
import { Service } from "typedi";
import Container from "../container";
import ConfigService from "./config";

@Service()
export default class GitHubConfigService {
    private mqtt: MqttService;
    private logger: LoggerService;

    private static readonly topicType = "config";
    private static readonly topicAction = "change";

    constructor(private config: ConfigService) {
        this.mqtt = Container.get(MqttService);
        this.logger = Container.get(LoggerService);
    }

    public async start() {
        // always check immediately the service starts
        await this.checkForChanges();

        // now schedule again at the interval
        this.logger.info("Scheduling to run every", this.config.pollFrequency, "seconds");
        setInterval(() => this.checkForChanges(), this.config.pollFrequency * 1000);
    }

    private async checkForChanges() {
        const octokit = await this.login();

        for (const type of this.config.configFileTypes) {
            const typeConfig = this.config.getConfig(type);

            const file = await this.getFile(octokit, type);

            if (file) {
                // check if this file has changed
                if (typeConfig?.checksum === file.checksum) {
                    this.logger.info("File", type, "is unchanged");
                    continue;
                }

                this.publishConfigChange(type, file.content, file.checksum);
            }
        }
    }

    private async login() {
        const token = await this.config.gitHubToken;

        return new Octokit({
            auth: token,
        });
    }

    private async getFile(
        octokit: Octokit,
        fileType: ConfigFileType
    ): Promise<{ content: object; checksum: string } | undefined> {
        const filePath = path.join(this.config.path, `${fileType}.json`);

        this.logger.info(
            "Attempting to retrieve",
            fileType,
            "file from",
            `github://${this.config.gitHubUser}/${this.config.repo}/${this.config.branch}/${filePath}`
        );

        try {
            const { data } = await octokit.rest.repos.getContent({
                owner: this.config.gitHubUser!,
                repo: this.config.repo,
                ref: this.config.branch,
                path: filePath,
            });

            const { content, sha } = data as { content: string; sha: string };
            const buffer = Buffer.from(content, "base64");

            return {
                content: JSON.parse(buffer.toString()),
                checksum: sha,
            };
        } catch {
            this.logger.error("Could not retrieve", fileType, "file from GitHub");
        }

        return undefined;
    }

    private publishConfigChange(fileType: ConfigFileType, file: object, checksum: string) {
        const message = {
            payload: file,
            checksum,
        };

        this.mqtt.publish(
            GitHubConfigService.topicType,
            fileType,
            GitHubConfigService.topicAction,
            message
        );

        this.logger.info("Published updated", fileType, "config");
    }
}
