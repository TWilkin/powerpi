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

    get gitHubUser() {
        return this.getEnv("GITHUB_USER", undefined);
    }

    get gitHubToken(): Promise<string> {
        return this.getSecret("GITHUB");
    }

    get repo() {
        return this.getEnv("REPO", "powerpi-config");
    }

    get branch() {
        return this.getEnv("BRANCH", "main");
    }

    get path() {
        return this.getEnv("FILE_PATH", "");
    }

    get pollFrequency(): number {
        return this.getEnvInt("POLL_FREQUENCY", 5 * 60);
    }

    get configFileTypes() {
        const filter = (fileType: ConfigFileType, checkFileType: ConfigFileType, flag: boolean) =>
            flag || fileType !== checkFileType;

        return super.configFileTypes.filter(
            (fileType) =>
                filter(fileType, ConfigFileType.Events, this.eventsEnabled) &&
                filter(fileType, ConfigFileType.Schedules, this.schedulerEnabled),
        );
    }

    get schedulerEnabled() {
        return this.getEnvBoolean("SCHEDULER_ENABLED", true);
    }

    get eventsEnabled() {
        return this.getEnvBoolean("EVENTS_ENABLED", true);
    }
}

Container.override(CommonConfigService, ConfigService);
