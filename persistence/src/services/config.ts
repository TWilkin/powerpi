import { ConfigFileType, ConfigService as CommonConfigService } from "powerpi-common";
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

    get databaseHost() {
        return process.env["DB_HOST"] ?? "db";
    }

    get databasePort() {
        const str = process.env["DB_PORT"];
        if (str) {
            return parseInt(str);
        }

        return 5432;
    }

    get databaseUser() {
        return process.env["DB_USER"] ?? "powerpi";
    }

    get databasePassword() {
        return this.getSecret("DB");
    }

    get databaseSchema() {
        return process.env["DB_SCHEMA"] ?? "powerpi";
    }

    get databaseURI() {
        return this.databasePassword.then((password) => {
            return `postgres://${this.databaseUser}:${password}@${this.databaseHost}:${this.databasePort}/${this.databaseSchema}`;
        });
    }
}

Container.override(CommonConfigService, ConfigService);
