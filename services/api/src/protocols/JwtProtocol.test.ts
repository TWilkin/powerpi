import { Req } from "@tsed/common";
import { ExtractJwt, Strategy } from "passport-jwt";
import { instance, mock, when } from "ts-mockito";
import Container from "../Container.js";
import { ConfigService } from "../services/index.js";
import JwtService from "../services/JwtService.js";
import UserService from "../services/UserService.js";
import JwtProtocol, { getSecret, getToken } from "./JwtProtocol.js";

const mockedJwtService = mock<JwtService>();
const mockedUserService = mock<UserService>();
const mockedConfigService = mock<ConfigService>();
const mockedRequest = mock<Req>();

describe("JwtProtocol", () => {
    let subject: JwtProtocol | undefined;

    beforeEach(() => {
        subject = new JwtProtocol(instance(mockedJwtService), instance(mockedUserService));
    });

    describe("$onVerify", () => {
        test("no user", async () => {
            when(mockedUserService.users).thenReturn([{ email: "someone@user.com" }]);

            const result = await subject?.$onVerify({
                email: "user@user.com",
                provider: "google",
                sub: "subject",
            });

            expect(result).toBeFalsy();
        });

        test("user", async () => {
            when(mockedUserService.users).thenReturn([
                { email: "someone@user.com" },
                { email: "user@user.com" },
            ]);

            const result = await subject?.$onVerify({
                email: "user@user.com",
                provider: "google",
                sub: "subject",
            });

            expect(result).toStrictEqual({ email: "user@user.com" });
        });
    });

    test("$onInstall", async () => {
        when(mockedJwtService.audience).thenReturn("something");
        when(mockedJwtService.issuer).thenReturn("else");

        const options = {
            issuer: "issuer",
            audience: "audience",
        };

        const strategy = {
            _verifOpts: options,
        } as unknown as Strategy;

        await subject?.$onInstall(strategy);

        expect(options.audience).toBe("something");
        expect(options.issuer).toBe("else");
    });
});

describe("getSecret", () => {
    vi.spyOn(Container, "get").mockImplementation((_) => instance(mockedConfigService));

    test("no secret", () => {
        when(mockedConfigService.getJWTSecret()).thenReject(new Error());

        function callback(error: string | null, secret: string | Buffer | undefined) {
            expect(error).toBeDefined();
            expect(secret).toBeUndefined();
        }

        getSecret(instance(mockedRequest), "str", callback);

        expect.assertions(2);
    });

    test("secret", () => {
        when(mockedConfigService.getJWTSecret()).thenResolve("a secret");

        function callback(error: string | null, secret: string | Buffer | undefined) {
            expect(error).toBeNull();
            expect(secret).toBe("a secret");
        }

        getSecret(instance(mockedRequest), "str", callback);

        expect.assertions(2);
    });
});

describe("getToken", () => {
    test("no token, no cookie", () => {
        vi.spyOn(ExtractJwt, "fromAuthHeaderAsBearerToken").mockImplementation(() => (_) => null);

        expect(getToken(instance(mockedRequest))).toBeNull();
    });

    test("no token, cookie", () => {
        vi.spyOn(ExtractJwt, "fromAuthHeaderAsBearerToken").mockImplementation(() => (_) => null);

        when(mockedRequest.cookies).thenReturn({ jwt: "jwt from cookie" });

        expect(getToken(instance(mockedRequest))).toBe("jwt from cookie");
    });

    test("token", () => {
        vi.spyOn(ExtractJwt, "fromAuthHeaderAsBearerToken").mockImplementation(
            () => (_) => "my jwt",
        );

        expect(getToken(instance(mockedRequest))).toBe("my jwt");
    });
});
