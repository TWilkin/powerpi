import { ConfigFileType, LoggerService } from "@powerpi/common";
import path from "path";
import { Service } from "typedi";
import yaml from "yaml";
import ConfigPublishService from "./ConfigPublishService";
import ConfigService from "./ConfigService";
import ConfigServiceArgumentService from "./ConfigServiceArgumentService";
import OctokitService from "./OctokitService";
import ValidatorService, { ValidationException } from "./ValidatorService";
import HandlerFactory from "./handlers/HandlerFactory";

@Service()
export default class GitHubConfigService {
    private readonly supportedFormats = ["yaml", "yml", "json"];

    private validated: { [key: string]: boolean };

    constructor(
        private readonly publishService: ConfigPublishService,
        private readonly handlerFactory: HandlerFactory,
        private readonly validator: ValidatorService,
        private readonly octokit: OctokitService,
        private readonly config: ConfigService,
        private readonly args: ConfigServiceArgumentService,
        private readonly logger: LoggerService,
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
        for await (const { fileType, fileName } of this.listFiles()) {
            const typeConfig = this.config.getConfig(fileType);

            const file = await this.getFile(fileType, fileName);

            if (file) {
                // check if this file has changed
                if (typeConfig?.checksum === file.checksum) {
                    this.logger.info("File", fileType, "is unchanged");

                    // should we re-validate it?
                    if (!this.validated[fileType]) {
                        await this.validate(fileType, file.content);
                    }

                    continue;
                } else {
                    // it's a new file so it's unvalidated
                    this.validated[fileType] = false;
                }

                // validate the new file, and don't publish if it's not okay
                const valid = await this.validate(fileType, file.content);
                if (!valid) {
                    continue;
                }

                this.publishService.publishConfigChange(fileType, file.content, file.checksum);

                // pass to a handler for additional processing (if any)
                const handler = this.handlerFactory.build(fileType);
                handler?.handle(file.content);
            }
        }
    }

    private async *listFiles() {
        this.logger.info(
            "Listing contents from",
            `github://${this.config.gitHubUser}/${this.config.repo}/${this.config.branch}`,
        );

        try {
            const data = await this.octokit.getContent(this.config.path);
            const files = (data as { name: string }[]).map((file) => file.name);

            for (const fileType of this.config.configFileTypes) {
                for (const extension of this.supportedFormats) {
                    const fileName = `${fileType}.${extension}`;

                    if (files.indexOf(fileName) !== -1) {
                        this.logger.info("Found", fileName, "for type", fileType);
                        yield { fileType, fileName };
                        break;
                    }
                }
            }
        } catch (ex) {
            this.logger.error(ex);
            this.logger.error("Could not retrieve directory listing from GitHub");
        }
    }

    private async getFile(fileType: ConfigFileType, fileName: string) {
        const filePath = path.join(this.config.path, fileName);

        this.logger.info(
            "Attempting to retrieve",
            fileType,
            "file from",
            `github://${this.config.gitHubUser}/${this.config.repo}/${this.config.branch}/${filePath}`,
        );

        try {
            const data = await this.octokit.getContent(filePath);

            const { content, sha } = data as { content: string; sha: string };
            const buffer = Buffer.from(content, "base64");

            return {
                content: this.parseFile(fileName, buffer.toString()),
                checksum: sha,
            };
        } catch (ex) {
            this.logger.error(ex);
            this.logger.error("Could not retrieve", fileName, "from GitHub");
        }

        return undefined;
    }

    private parseFile(fileName: string, content: string) {
        if (fileName.endsWith("json")) {
            return JSON.parse(content);
        }

        // otherwise it must be YAML
        return yaml.parse(content);
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
}
