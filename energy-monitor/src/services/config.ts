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

    getUsedConfig() {
        return [];
    }

    get configIsNeeded() {
        return false;
    }

    get ihdId() {
        return this.getSecret("IHD").then((id) => id.replace(/-|:/g, "").toUpperCase());
    }

    get n3rgyApiBase() {
        return process.env["N3RGY_API_BASE"] ?? "https://consumer-api.data.n3rgy.com";
    }

    get retryInterval() {
        const str = process.env["RETRY_INTERVAL"] ?? "2 hours";
        return this.interval.parse(str);
    }

    get timeoutOffset() {
        const str = process.env["TIMEOUT_OFFSET"] ?? "30 minutes";
        return this.interval.parse(str);
    }
}

Container.override(CommonConfigService, ConfigService);
