import { Controller, Get, Req, Res, Session } from "@tsed/common";
import { Authenticate } from "@tsed/passport";
import passport from "passport";
import User from "../models/user";
import Config from "../services/config";
import JwtService from "../services/jwt";

@Controller("/auth")
export default class AuthController {
  constructor(
    private readonly config: Config,
    private readonly jwtService: JwtService
  ) {}

  @Get("/google")
  google(@Req() request: Req, @Session() session: any) {
    const referrer = request.get("Referrer");
    if (referrer) {
      session.redirectUri = referrer;
    }

    return passport.authenticate("google", { scope: ["profile", "email"] });
  }

  @Get("/google/callback")
  @Authenticate("google")
  async googleCallback(
    @Req("user") user: User,
    @Session("redirectUri") redirectUri: string,
    @Res() response: Res
  ) {
    const jwt = await this.jwtService.createJWT(user, "google");

    response.cookie(JwtService.cookieKey, jwt, {
      secure: this.config.usesHttps,
      httpOnly: !this.config.usesHttps,
      sameSite: true
    });

    if (redirectUri) {
      response.redirect(redirectUri);
    }

    response.send();
  }
}
