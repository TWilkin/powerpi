import { Arg, OnVerify, Protocol } from "@tsed/passport";
import { BasicStrategy, BasicStrategyOptions } from "passport-http";
import ConfigService from "../services/ConfigService.js";

@Protocol<BasicStrategyOptions>({
    name: "client_credentials",
    useStrategy: BasicStrategy,
})
export default class ClientCredentialsProtocol implements OnVerify {
    constructor(private readonly config: ConfigService) {}

    async $onVerify(@Arg(0) clientId: string, @Arg(1) clientSecret: string) {
        const credentials = (await this.config.getAuthConfig()).find(
            (authConfig) => authConfig.name === "oauth",
        );

        if (credentials) {
            return clientId === credentials.clientId && clientSecret === credentials.clientSecret;
        }

        return false;
    }
}
