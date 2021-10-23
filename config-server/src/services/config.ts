import { ConfigService as CommonConfigService } from "powerpi-common";
import { Service } from "typedi";
import Container from "../container";
import app from "../../package.json";

@Service()
export default class ConfigService extends CommonConfigService {
    get service() {
        return app.name;
    }

    get version() {
        return app.version;
    }

    get gitHubUser(): string | undefined {
        return process.env["GITHUB_USER"];
    }

    get gitHubToken(): Promise<string> {
        return this.getSecret("GITHUB");
    }

    get repo(): string {
        return process.env["REPO"] ?? "powerpi-config";
    }

    get branch(): string {
        return process.env["BRANCH"] ?? "master";
    }

    get path(): string {
        return process.env["FILE_PATH"] ?? "";
    }

    get pollFrequency(): number {
        const frequency = process.env["POLL_FREQUENCY"];
        if (frequency) {
            return parseInt(frequency);
        }

        return 5 * 60;
    }
}

Container.set(CommonConfigService, new ConfigService());
