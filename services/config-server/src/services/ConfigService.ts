import { ConfigService as CommonConfigService, ConfigFileType } from "@powerpi/common";
import { Service } from "typedi";
import app from "../../package.json";
import Container from "../container";

@Service()
export default class ConfigService extends CommonConfigService {
    get service() {
        return app.name;
    }

    get version() {
        return app.version;
    }

    getUsedConfig() {
        return [];
    }

    get configIsNeeded() {
        return false;
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
        return process.env["BRANCH"] ?? "main";
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

    get configFileTypes() {
        return super.configFileTypes.filter(
            (fileType) => this.schedulerEnabled || fileType !== ConfigFileType.Schedules,
        );
    }

    get schedulerEnabled() {
        const enabled = process.env["SCHEDULER_ENABLED"] ?? "true";
        return enabled.toLowerCase() === "true";
    }
}

Container.override(CommonConfigService, ConfigService);
