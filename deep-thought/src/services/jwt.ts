import { Service } from "@tsed/common";
import jwt from "jsonwebtoken";
import User from "../models/user";
import Config from "./config";

@Service()
export default class JwtService {
  constructor(private readonly config: Config) {}

  public get audience() {
    return `http://${this.config.externalHostName}:${this.config.externalPort}`;
  }

  public get issuer() {
    return this.audience;
  }

  public async createJWT(user: User, provider: string) {
    const body = {
      email: user.email,
      provider
    };

    const options = {
      audience: this.audience,
      issuer: this.issuer,
      expiresIn: "30 days",
      subject: user.subject
    };

    const token = jwt.sign(body, await this.config.getJWTSecret(), options);

    return token;
  }
}
