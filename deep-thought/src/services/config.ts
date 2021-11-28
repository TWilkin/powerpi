import { Injectable, ProviderScope, ProviderType } from "@tsed/common";
import { ConfigFileType, ConfigService as CommonConfigService } from "powerpi-common";
import { Service } from "typedi";
import app from "../../package.json";
import Container from "../container";
import AuthConfig from "../models/auth";

@Service()
@Injectable({
    type: ProviderType.VALUE,
    scope: ProviderScope.SINGLETON,
    useFactory: () => Container.get(ConfigService),
})
export default class ConfigService extends CommonConfigService {
    constructor() {
        super();
        console.log("here");
    }

    get service() {
        return app.name;
    }

    get version() {
        return app.version;
    }

    getUsedConfig(): ConfigFileType[] {
        return [ConfigFileType.Devices, ConfigFileType.Schedules];
    }

    get externalHostName() {
        return process.env.EXTERNAL_HOST_NAME;
    }

    get externalPort() {
        return process.env.EXTERNAL_PORT;
    }

    get usesHttps() {
        return process.env.USE_HTTP !== "true";
    }

    get externalUrlBase() {
        const https = this.usesHttps ? "s" : "";
        return `http${https}://${this.externalHostName}:${this.externalPort}`;
    }

    async getDatabaseURI() {
        const user = process.env.DB_USER;
        const password = await this.readFile(process.env.DB_PASSWORD_FILE as string);
        const host = process.env.DB_HOST;
        const port = process.env.DB_PORT ?? 5432;
        const schema = process.env.DB_SCHEMA;

        return `postgres://${user}:${password}@${host}:${port}/${schema}`;
    }

    async getAuthConfig(): Promise<AuthConfig[]> {
        const protocols = ["google", "oauth"];

        return await Promise.all(
            protocols.map(async (name) => {
                const envPrefix = name.toUpperCase();

                const secret = await this.getSecret(envPrefix);

                return {
                    name,
                    clientId: process.env[`${envPrefix}_CLIENT_ID`],
                    clientSecret: secret,
                } as AuthConfig;
            })
        );
    }

    async getJWTSecret(): Promise<string> {
        return await this.getSecret("JWT");
    }

    async getSessionSecret(): Promise<string> {
        return await this.getSecret("SESSION");
    }
}

Container.override(CommonConfigService, ConfigService);
