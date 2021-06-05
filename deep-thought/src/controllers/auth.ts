import { Controller, Get, Req, Res } from "@tsed/common";
import { Authenticate } from "@tsed/passport";
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
  @Authenticate("google", { scope: ["profile", "email"] })
  google() {
    // doesn't need to do anything
  }

  @Get("/google/callback")
  @Authenticate("google")
  async googleCallback(@Req("user") user: User, @Res() response: Res) {
    const jwt = await this.jwtService.createJWT(user, "google");

    response
      .cookie(JwtService.cookieKey, jwt, {
        secure: this.config.usesHttps,
        httpOnly: !this.config.usesHttps,
        sameSite: true
      })
      .send();
  }
}
