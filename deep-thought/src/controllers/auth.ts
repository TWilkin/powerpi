import { Controller, Get, Req } from "@tsed/common";
import { Authenticate } from "@tsed/passport";
import User from "../models/user";
import JwtService from "../services/jwt";

@Controller("/auth")
export default class AuthController {
  constructor(private readonly jwtService: JwtService) {}

  @Get("/google")
  @Authenticate("google", { scope: ["profile", "email"] })
  google() {
    // doesn't need to do anything
  }

  @Get("/google/callback")
  @Authenticate("google")
  async googleCallback(@Req("user") user: User) {
    return await this.jwtService.createJWT(user, "google");
  }
}
