import { PowerPiService } from "@powerpi/common";
import Container from "./container";
import GitHubConfigService from "./services/GitHubConfigService";
import ValidatorService from "./services/ValidatorService";

async function start() {
    const validator = Container.get(ValidatorService);
    await validator.initialise();

    const github = Container.get(GitHubConfigService);
    github.start();
}

const service = Container.get(PowerPiService);
service.start(start);
