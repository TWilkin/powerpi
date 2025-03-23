import { ConfigService as CommonConfigService } from "@powerpi/common";
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

    getUsedConfig() {
        return [];
    }

    get configIsNeeded() {
        return false;
    }

    get ihdId() {
        return this.getSecret("IHD").then((id) => id.replace(/[-|]:/g, "").toUpperCase());
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

    get maximumThreshold() {
        const threshold = process.env["MAXIMUM_THRESHOLD"];
        if (threshold) {
            return parseInt(threshold);
        }

        return undefined;
    }

    get messageWriteDelay() {
        const delay = process.env["MESSAGE_WRITE_DELAY"] ?? 100;

        if (typeof delay === "string") {
            return parseInt(delay);
        }

        return delay;
    }
}

Container.override(CommonConfigService, ConfigService);
