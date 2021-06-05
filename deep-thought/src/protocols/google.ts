import { OnInstall, OnVerify, Protocol } from "@tsed/passport";
import { Strategy, StrategyOptions } from "passport-google-oauth20";
import Config from "../services/config";
import UserService from "../services/user";

interface GoogleStrategy {
  _oauth2: {
    _clientId: string;
    _clientSecret: string;
  };
  _callbackURL: string;
}

@Protocol<StrategyOptions>({
  name: "google",
  useStrategy: Strategy,
  settings: {
    clientID: "default",
    clientSecret: "default",
    callbackURL: "default"
  }
})
class GoogleProtocol implements OnVerify, OnInstall {
  constructor(private config: Config, private userService: UserService) {}

  async $onVerify() {
    const user = this.userService.users.find(
      (registeredUser) => registeredUser.name === "admin"
    );

    if (!user) {
      return false;
    }

    return user;
  }

  async $onInstall(strategy: Strategy) {
    const googleStrategy = strategy as unknown as GoogleStrategy;

    const config = (await this.config.getAuthConfig()).find(
      (authConfig) => authConfig.name === "google"
    );

    googleStrategy._oauth2._clientId = config!.clientId;
    googleStrategy._oauth2._clientSecret = config!.clientSecret;
    googleStrategy._callbackURL = `https://${this.config.externalHostName}/api/google/callback`;
  }
}
export default GoogleProtocol;
