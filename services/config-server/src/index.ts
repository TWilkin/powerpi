import { LoggerService, PowerPiService } from "@powerpi/common";
import Container from "./container.js";
import ConfigServiceArgumentService from "./services/ConfigServiceArgumentService.js";
import GitHubConfigService from "./services/GitHubConfigService.js";
import ValidatorService from "./services/ValidatorService.js";

async function start() {
    const args = Container.get(ConfigServiceArgumentService);
    if (args.options.daemon) {
        const logger = Container.get(LoggerService);
        logger.info("Running as a daemon");
    }

    const validator = Container.get(ValidatorService);
    await validator.initialise();

    const github = Container.get(GitHubConfigService);
    github.start();
}

const service = Container.get(PowerPiService);
service.start(start);
