import { ConfigService as CommonConfigService, ConfigFileType } from "@powerpi/common";
import { Service } from "typedi";
import app from "../../package.json" with { type: "json" };
import Container from "../Container.js";

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
