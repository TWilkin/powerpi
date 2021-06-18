import {
  $log,
  Controller,
  Get,
  Post,
  QueryParams,
  Req,
  Res,
  Session
} from "@tsed/common";
import { Authenticate, Authorize } from "@tsed/passport";
import crypto from "crypto";
import passport from "passport";
import User from "../models/user";
import Config from "../services/config";
import JwtService from "../services/jwt";
import UserService from "../services/user";
import HttpStatus = require("http-status-codes");

@Controller("/auth")
export default class AuthController {
  constructor(
    private readonly config: Config,
    private readonly jwtService: JwtService,
    private readonly userService: UserService
  ) {}

  @Get("/google")
  async google(
    @Session() session: any,
    @QueryParams("redirect_uri") redirectUri: string,
    @QueryParams("response_type") responseType: string,
    @QueryParams("state") state: string,
    @QueryParams("client_id") clientId: string,
    @Res() response: Res
  ) {
    if (redirectUri) {
      session.redirectUri = state
        ? `${redirectUri}?state=${state}`
        : redirectUri;
    }

    if (responseType === "code") {
      session.useCode = true;
    }

    if (clientId) {
      const credentials = (await this.config.getAuthConfig()).find(
        (authConfig) => authConfig.name === "oauth"
      );

      if (credentials?.clientId !== clientId) {
        response.status(HttpStatus.FORBIDDEN).send();
        return;
      }
    }

    return passport.authenticate("google", {
      scope: ["profile", "email"],
      session: false
    });
  }

  @Get("/google/callback")
  @Authenticate("google", { session: false })
  async googleCallback(
    @Req("user") user: User,
    @Session("redirectUri") redirectUri: string,
    @Session("useCode") useCode: boolean,
    @Res() response: Res
  ) {
    if (useCode) {
      const code = crypto.randomBytes(64).toString("hex");

      this.userService.pushUser(code, user);

      const splitter = redirectUri.indexOf("?") >= 0 ? "&" : "?";
      redirectUri = `${redirectUri}${splitter}code=${code}`;
    } else {
      const jwt = await this.jwtService.createJWT(user, "google");

      response.cookie(JwtService.cookieKey, jwt, {
        secure: this.config.usesHttps,
        httpOnly: !this.config.usesHttps,
        sameSite: true
      });
    }

    if (redirectUri) {
      $log.info(`Redirecting user to ${redirectUri}`);
      response.redirect(redirectUri);
    }
  }

  @Post("/google/token")
  @Authorize("client_credentials")
  async googleToken(@QueryParams("code") code: string, @Res() response: Res) {
    /*const user = this.userService.popUser(code);
    if (!user) {
      response.status(HttpStatus.FORBIDDEN);
    }*/
    const user = this.userService.users[0];

    const jwt = await this.jwtService.createJWT(user, "google");
    const decoded = await this.jwtService.parse(jwt);

    return {
      access_token: jwt,
      token_type: "bearer",
      expires_in: Math.round(decoded.exp - Date.now() / 1000)
    };
  }
}
