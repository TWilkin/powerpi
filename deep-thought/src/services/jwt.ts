import { Service } from "@tsed/common";
import jwt from "jsonwebtoken";
import User from "../models/user";
import Config from "./config";

interface Token {
    email: string;
    provider: string;
    iat: number;
    exp: number;
    aud: string;
    iss: string;
    sub: string;
}

@Service()
export default class JwtService {
    constructor(private readonly config: Config) {}

    public static get cookieKey() {
        return "jwt";
    }

    public get audience() {
        return this.config.externalUrlBase;
    }

    public get issuer() {
        return this.config.externalUrlBase;
    }

    public async createJWT(user: User, provider: string) {
        const body = {
            email: user.email,
            provider,
        };

        const options = {
            audience: this.audience,
            issuer: this.issuer,
            expiresIn: "30 days",
            subject: user.subject,
        };

        const token = jwt.sign(body, await this.config.getJWTSecret(), options);

        return token;
    }

    public async parse(token: string): Promise<Token> {
        return jwt.verify(token, await this.config.getJWTSecret()) as Token;
    }
}
