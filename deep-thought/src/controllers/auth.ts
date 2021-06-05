import { Controller, Get, Req } from "@tsed/common";
import { Authenticate } from "@tsed/passport";

@Controller("/auth")
export default class AuthController {
  @Get("/google/callback")
  @Authenticate("google")
  googleCallback(@Req("user") user: Req) {
    return user;
  }
}
