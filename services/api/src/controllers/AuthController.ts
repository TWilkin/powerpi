import { IUser } from "@powerpi/common";
import {
    $log,
    BodyParams,
    Controller,
    Get,
    Post,
    QueryParams,
    Req,
    Res,
    Session,
} from "@tsed/common";
import { Authenticate, Authorize } from "@tsed/passport";
import crypto from "crypto";
import { Session as ExpressSession } from "express-session";
import { StatusCodes } from "http-status-codes";
import passport from "passport";
import ConfigService from "../services/ConfigService.js";
import JwtService from "../services/JwtService.js";
import UserService from "../services/UserService.js";

export interface AuthSession extends ExpressSession {
    redirectUri: string;
    useCode: boolean;
}

@Controller("/auth")
export default class AuthController {
    constructor(
        private readonly config: ConfigService,
        private readonly jwtService: JwtService,
        private readonly userService: UserService,
    ) {}

    @Get("/google")
    async google(
        @Session() session: AuthSession,
        @QueryParams("redirect_uri") redirectUri: string,
        @QueryParams("response_type") responseType: string,
        @QueryParams("state") state: string,
        @QueryParams("client_id") clientId: string,
        @Res() response: Res,
    ) {
        if (redirectUri) {
            session.redirectUri = state ? `${redirectUri}?state=${state}` : redirectUri;
        }

        if (responseType === "code") {
            session.useCode = true;
        }

        if (clientId) {
            const credentials = (await this.config.getAuthConfig()).find(
                (authConfig) => authConfig.name === "oauth",
            );

            if (credentials?.clientId !== clientId) {
                response.status(StatusCodes.FORBIDDEN).send();
                return;
            }
        }

        return passport.authenticate("google", {
            scope: ["profile", "email"],
            session: false,
        });
    }

    @Get("/google/callback")
    @Authenticate("google", { session: false })
    async googleCallback(
        @Req("user") user: IUser,
        @Session("redirectUri") redirectUri: string,
        @Session("useCode") useCode: boolean,
        @Res() response: Res,
    ) {
        if (useCode) {
            const code = crypto.randomBytes(64).toString("hex");

            this.userService.pushUser(code, user);

            const splitter = redirectUri.indexOf("?") >= 0 ? "&" : "?";
            redirectUri = `${redirectUri}${splitter}code=${code}`;
        } else {
            const jwt = await this.jwtService.createJWT(user, "google");
            const decoded = await this.jwtService.parse(jwt);

            response.cookie(JwtService.cookieKey, jwt, {
                secure: this.config.usesHttps,
                httpOnly: false,
                sameSite: true,
                expires: new Date(decoded.exp * 1000),
            });
        }

        if (redirectUri) {
            $log.info(`Redirecting user to ${redirectUri}`);
            response.redirect(redirectUri);
        }
    }

    @Post("/google/token")
    @Authorize("client_credentials")
    async googleToken(@BodyParams("code") code: string, @Res() response: Res) {
        const user = this.userService.popUser(code);
        if (!user) {
            response.status(StatusCodes.FORBIDDEN).send();
            return;
        }

        const jwt = await this.jwtService.createJWT(user, "google");
        const decoded = await this.jwtService.parse(jwt);

        return {
            access_token: jwt,
            token_type: "bearer",
            expires_in: Math.round(decoded.exp - Date.now() / 1000),
        };
    }
}
