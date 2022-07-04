import { Octokit } from "@octokit/rest";
import { ConfigFileType, LoggerService } from "@powerpi/common";
import path from "path";
import { Service } from "typedi";
import Container from "../container";
import ConfigService from "./config";
import ConfigPublishService from "./ConfigPublishService";
import HandlerFactory from "./handlers/HandlerFactory";

@Service()
export default class GitHubConfigService {
    private publishService: ConfigPublishService;
    private logger: LoggerService;
    private handlerFactory: HandlerFactory;

    constructor(private config: ConfigService) {
        this.publishService = Container.get(ConfigPublishService);
        this.logger = Container.get(LoggerService);
        this.handlerFactory = Container.get(HandlerFactory);
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

                this.publishService.publishConfigChange(type, file.content, file.checksum);

                // pass to a handler for additional processing (if any)
                const handler = this.handlerFactory.build(type);
                handler?.handle(file.content);
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
            const user = this.config.gitHubUser;
            if (!user) {
                this.logger.error("No GitHub user set.");
                return undefined;
            }

            const { data } = await octokit.rest.repos.getContent({
                owner: user,
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
}
