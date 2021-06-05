import { Service } from "@tsed/common";
import jwt from "jsonwebtoken";
import User from "../models/user";
import Config from "./config";

@Service()
export default class UserService {
  private _users: User[] | undefined;

  constructor(private readonly config: Config) {}

  public get users() {
    return this._users ?? [];
  }

  public async createJWT(user: User, provider: string) {
    const body = {
      sub: user.subject,
      email: user.email,
      provider
    };

    const token = jwt.sign(body, await this.config.getJWTSecret());

    return token;
  }

  public async $onInit() {
    await this.initialise();
  }

  private async initialise() {
    this._users = await this.config.getUsers();
  }
}
