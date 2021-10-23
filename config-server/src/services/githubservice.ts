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

    private checksums: { [key: string]: string | undefined };

    constructor(private config: ConfigService) {
        this.mqtt = Container.get(MqttService);
        this.logger = Container.get(LoggerService);

        this.checksums = {};
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

        for (const type of fileTypes) {
            const file = await this.getFile(octokit, type);

            if (file) {
                // check if this file has changed
                if (this.checksums[type] === file.checksum) {
                    this.logger.info("File", type, "is unchanged");
                    continue;
                }

                this.checksums[type] = file.checksum;

                this.publishConfigChange(type, file.content);
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
        fileType: string
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

    private publishConfigChange(fileType: string, file: object) {
        const message = {
            payload: file,
        };

        this.mqtt.publish("config", fileType, "change", message);

        this.logger.info("Published updated", fileType, "config");
    }
}
