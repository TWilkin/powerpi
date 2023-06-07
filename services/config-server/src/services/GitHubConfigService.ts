import { Octokit } from "@octokit/rest";
import { ConfigFileType, LoggerService } from "@powerpi/common";
import path from "path";
import { Service } from "typedi";
import ConfigPublishService from "./ConfigPublishService";
import ConfigService from "./ConfigService";
import ConfigServiceArgumentService from "./ConfigServiceArgumentService";
import ValidatorService, { ValidationException } from "./ValidatorService";
import HandlerFactory from "./handlers/HandlerFactory";

@Service()
export default class GitHubConfigService {
    private validated: { [key: string]: boolean };

    constructor(
        private readonly publishService: ConfigPublishService,
        private readonly handlerFactory: HandlerFactory,
        private readonly validator: ValidatorService,
        private readonly config: ConfigService,
        private readonly args: ConfigServiceArgumentService,
        private readonly logger: LoggerService
    ) {
        this.validated = {};
    }

    public async start() {
        // always check immediately the service starts
        await this.checkForChanges();

        // now schedule again at the interval
        if (this.args.options.daemon) {
            this.logger.info("Scheduling to run every", this.config.pollFrequency, "seconds");
            setInterval(() => this.checkForChanges(), this.config.pollFrequency * 1000);
        } else {
            process.exit(0);
        }
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

                    // should we re-validate it?
                    if (!this.validated[type]) {
                        await this.validate(type, file.content);
                    }

                    continue;
                } else {
                    // it's a new file so it's unvalidated
                    this.validated[type] = false;
                }

                // validate the new file, and don't publish if it's not okay
                const valid = await this.validate(type, file.content);
                if (!valid) {
                    continue;
                }

                this.publishService.publishConfigChange(type, file.content, file.checksum);

                // pass to a handler for additional processing (if any)
                const handler = this.handlerFactory.build(type);
                handler?.handle(file.content);
            }
        }
    }

    private async validate(type: ConfigFileType, content: object) {
        this.logger.info("Validating file", type);

        let valid = false;

        try {
            valid = await this.validator.validate(type, content);

            if (!valid) {
                throw new ValidationException(type, undefined);
            }
        } catch (ex) {
            this.logger.error(ex);

            if (ex instanceof ValidationException) {
                this.publishService.publishConfigError(type, ex.message, ex.errors);
            }

            valid = false;
        }

        // the file is validated, so don't do it again
        this.validated[type] = true;

        return valid;
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
