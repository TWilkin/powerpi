import { $log } from "@tsed/logger";
import { Arg, OnInstall, OnVerify, Protocol } from "@tsed/passport";
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

interface Profile {
  id: string;
  emails: { value: string; verified: boolean }[];
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

  async $onVerify(@Arg(2) profile: Profile) {
    const userEmails = profile.emails
      .filter((entry) => entry.verified)
      .map((entry) => entry.value);

    const user = this.userService.users.find((registeredUser) =>
      userEmails.find((email) => email === registeredUser.email)
    );

    if (!user) {
      return false;
    }

    user.subject = profile.id;

    return user;
  }

  async $onInstall(strategy: Strategy) {
    const googleStrategy = strategy as unknown as GoogleStrategy;

    const config = (await this.config.getAuthConfig()).find(
      (authConfig) => authConfig.name === "google"
    );

    googleStrategy._oauth2._clientId = config!.clientId;
    googleStrategy._oauth2._clientSecret = config!.clientSecret;
    googleStrategy._callbackURL = `http://${this.config.externalHostName}:${this.config.externalPort}/api/auth/google/callback`;
  }
}
export default GoogleProtocol;
