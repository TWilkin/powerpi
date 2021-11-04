import { ConfigFileType, ConfigService as CommonConfigService } from "powerpi-common";
import { Service } from "typedi";
import Container from "../container";
import app = require("../../package.json");

@Service()
export default class ConfigService extends CommonConfigService {
    get service() {
        return app.name;
    }

    get version() {
        return app.version;
    }

    getUsedConfig(): ConfigFileType[] {
        return [ConfigFileType.Devices];
    }

    get port() {
        const str = process.env["JOVO_PORT"];
        if (str) {
            return parseInt(str);
        }

        return 3000;
    }
}

Container.override(CommonConfigService, ConfigService);
