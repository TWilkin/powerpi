import { ConfigFileType, ConfigService as CommonConfigService } from "@powerpi/common";
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

    get configIsNeeded() {
        return false;
    }

    getUsedConfig(): ConfigFileType[] {
        return [];
    }
}

Container.override(CommonConfigService, ConfigService);
