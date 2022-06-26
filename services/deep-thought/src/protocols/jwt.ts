import { Arg, OnInstall, OnVerify, Protocol } from "@tsed/passport";
import { Request } from "express";
import { ExtractJwt, Strategy, StrategyOptions } from "passport-jwt";
import ConfigService from "../services/config";
import JwtService from "../services/jwt";
import UserService from "../services/user";

interface JWT {
    sub: string;
    email: string;
    provider: string;
}

interface JwtStrategy {
    _verifOpts: {
        issuer: string;
        audience: string;
    };
}

@Protocol<StrategyOptions>({
    name: "jwt",
    useStrategy: Strategy,
    settings: {
        jwtFromRequest: getToken,
        secretOrKeyProvider: getSecret,
    },
})
export default class JwtProtocol implements OnVerify, OnInstall {
    constructor(
        private readonly jwtService: JwtService,
        private readonly userService: UserService
    ) {}

    async $onVerify(@Arg(0) jwt: JWT) {
        const user = this.userService.users.find(
            (registeredUser) => registeredUser.email === jwt.email
        );

        if (user) {
            return user;
        }

        return false;
    }

    async $onInstall(strategy: Strategy) {
        const jwtStrategy = strategy as unknown as JwtStrategy;

        jwtStrategy._verifOpts.audience = this.jwtService.audience;
        jwtStrategy._verifOpts.issuer = this.jwtService.issuer;
    }
}

async function getSecret(
    _: Request,
    __: string,
    done: (err: string | null | unknown, secret?: string) => void
) {
    try {
        const secret = await new ConfigService().getJWTSecret();
        done(null, secret);
    } catch (error) {
        done(error);
    }
}

function getToken(request: Request): string | null {
    // read from the authorization header
    let token = ExtractJwt.fromAuthHeaderAsBearerToken()(request);

    if (!token && request.cookies && request.cookies[JwtService.cookieKey]) {
        // read from a cookie
        token = request.cookies[JwtService.cookieKey];
    }

    return token;
}
