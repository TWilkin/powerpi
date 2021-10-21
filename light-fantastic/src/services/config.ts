import { ConfigService as CommonConfigService } from "powerpi-common";
import { Service } from "typedi";
import Container from "../container";
import app = require("../../package.json");
import Schedule from "../models/schedule";

@Service()
export default class ConfigService extends CommonConfigService {
    get service() {
        return app.name;
    }

    get version() {
        return app.version;
    }

    async schedule(): Promise<{ timezone: string; schedules: Schedule[] }> {
        return JSON.parse(await this.readFile(process.env["SCHEDULES_FILE"] as string));
    }
}

Container.set(CommonConfigService, new ConfigService());
