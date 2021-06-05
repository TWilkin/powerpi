import { Controller, Get, Req } from "@tsed/common";
import { Authenticate } from "@tsed/passport";
import User from "../models/user";
import UserService from "../services/user";

@Controller("/auth")
export default class AuthController {
  constructor(private userService: UserService) {}

  @Get("/google")
  @Authenticate("google", { scope: ["profile", "email"] })
  google() {
    // doesn't need to do anything
  }

  @Get("/google/callback")
  @Authenticate("google")
  googleCallback(@Req("user") user: User) {
    return this.userService.createJWT(user, "google");
  }
}
