import { ConfigService as CommonConfigService, ConfigFileType } from "@powerpi/common";
import { Service } from "typedi";
import app from "../../package.json" with { type: "json" };
import Container from "../container.js";

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

    get apiAddress() {
        let address = process.env["API_ADDRESS"];

        if (!address) {
            const host = process.env["API_HOST"] ?? "api";

            let port = parseInt(process.env["API_PORT"] ?? "");
            if (isNaN(port)) {
                port = 80;
            }

            address = `http://${host}:${port}/api`;
        }

        return address;
    }
}

Container.override(CommonConfigService, ConfigService);
