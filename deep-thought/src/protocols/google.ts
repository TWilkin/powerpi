import { $log } from "@tsed/logger";
import { OnInstall, OnVerify, Protocol } from "@tsed/passport";
import { Strategy, StrategyOptions } from "passport-google-oauth20";
import UserService from "../services/user";

@Protocol<StrategyOptions>({
  name: "google",
  useStrategy: Strategy,
  settings: {
    clientID: "test",
    clientSecret: "test",
    callbackURL: "test"
  }
})
class GoogleProtocol implements OnVerify, OnInstall {
  constructor(private userService: UserService) {}

  async $onVerify() {
    const user = this.userService.users.find(
      (registeredUser) => registeredUser.name === "admin"
    );

    if (!user) {
      return false;
    }

    return user;
  }

  $onInstall(strategy: Strategy) {
    $log.info(JSON.stringify(strategy));
  }
}
export default GoogleProtocol;
