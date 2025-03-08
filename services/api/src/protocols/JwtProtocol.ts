import { Req } from "@tsed/common";
import { Arg, OnInstall, OnVerify, Protocol } from "@tsed/passport";
import { ExtractJwt, SecretOrKeyProvider, Strategy, StrategyOptions } from "passport-jwt";
import Container from "../Container.js";
import ConfigService from "../services/ConfigService.js";
import JwtService from "../services/JwtService.js";
import UserService from "../services/UserService.js";

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
        private readonly userService: UserService,
    ) {}

    async $onVerify(@Arg(0) jwt: JWT) {
        const user = this.userService.users.find(
            (registeredUser) => registeredUser.email === jwt.email,
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

export function getSecret(
    _: Parameters<SecretOrKeyProvider>[0],
    __: Parameters<SecretOrKeyProvider>[1],
    done: Parameters<SecretOrKeyProvider>[2],
) {
    const config = Container.get(ConfigService);

    config
        .getJWTSecret()
        .then((secret) => done(null, secret))
        .catch((error) => done(error));
}

export function getToken(request: Req): string | null {
    // read from the authorization header
    let token = ExtractJwt.fromAuthHeaderAsBearerToken()(request);

    if (!token && request.cookies?.[JwtService.cookieKey]) {
        // read from a cookie
        token = request.cookies[JwtService.cookieKey];
    }

    return token;
}
