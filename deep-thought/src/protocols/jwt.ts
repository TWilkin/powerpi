import { Req } from "@tsed/common";
import { Arg, OnVerify, Protocol } from "@tsed/passport";
import { ExtractJwt, Strategy, StrategyOptions } from "passport-jwt";
import Config from "../services/config";
import UserService from "../services/user";

interface JWT {
  sub: string;
  email: string;
  provider: string;
}

@Protocol<StrategyOptions>({
  name: "jwt",
  useStrategy: Strategy,
  settings: {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKeyProvider: getSecret
  }
})
export default class JwtProtocol implements OnVerify {
  constructor(private userService: UserService) {}

  async $onVerify(@Req() request: Req, @Arg(0) jwt: JWT) {
    const user = this.userService.users.find(
      (registeredUser) => registeredUser.email === jwt.email
    );

    if (user) {
      request.user = user;
      return user;
    }

    return false;
  }
}

function getSecret(_: any, __: any, done: (err: any, secret: string) => void) {
  new Config().getJWTSecret().then((key) => done(null, key));
}
