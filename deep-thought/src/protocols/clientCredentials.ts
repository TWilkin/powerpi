import { Arg, OnVerify, Protocol } from "@tsed/passport";
import { BasicStrategy, BasicStrategyOptions } from "passport-http";
import Config from "../services/config";

@Protocol<BasicStrategyOptions>({
  name: "client_credentials",
  useStrategy: BasicStrategy
})
export default class ClientCredentialsProtocol implements OnVerify {
  constructor(private readonly config: Config) {}

  async $onVerify(@Arg(0) clientId: string, @Arg(1) clientSecret: string) {
    const credentials = (await this.config.getAuthConfig()).find(
      (authConfig) => authConfig.name === "oauth"
    );

    return (
      clientId === credentials?.clientId &&
      clientSecret === credentials?.clientSecret
    );
  }
}
