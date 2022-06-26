import { PowerPiService } from "@powerpi/common";
import Container from "./container";
import GitHubConfigService from "./services/githubservice";

function start() {
    const github = Container.get(GitHubConfigService);
    github.start();
}

const service = Container.get(PowerPiService);
service.start(start);
