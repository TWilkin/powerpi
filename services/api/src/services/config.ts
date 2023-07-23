import { ConfigFileType, ConfigService as CommonConfigService } from "@powerpi/common";
import { Injectable, ProviderScope, ProviderType } from "@tsed/common";
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
    get service() {
        return app.name;
    }

    get version() {
        return app.version;
    }

    getUsedConfig(): ConfigFileType[] {
        return [ConfigFileType.Devices, ConfigFileType.Users];
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

    async hasPersistence() {
        try {
            await this.databaseURI;

            // it worked so the db is configured
            return true;
        } catch {
            return false;
        }
    }
}

Container.override(CommonConfigService, ConfigService);
