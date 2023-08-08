import { Req } from "@tsed/common";
import { ExtractJwt, Strategy } from "passport-jwt";
import { instance, mock, when } from "ts-mockito";
import Container from "../Container";
import { ConfigService } from "../services";
import JwtService from "../services/JwtService";
import UserService from "../services/UserService";
import JwtProtocol, { getSecret, getToken } from "./JwtProtocol";

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
    jest.spyOn(Container, "get").mockImplementation((_) => instance(mockedConfigService));

    test("no secret", async () => {
        when(mockedConfigService.getJWTSecret()).thenThrow(new Error());

        let actualError = null;
        let actualSecret = null;
        const done = (error: string | null | unknown, secret?: string) => {
            actualError = error;
            actualSecret = secret;
        };

        await getSecret(instance(mockedRequest), "str", done);

        expect(actualError).toBeDefined();
        expect(actualSecret).toBeUndefined();
    });

    test("secret", async () => {
        when(mockedConfigService.getJWTSecret()).thenResolve("a secret");

        let actualError = null;
        let actualSecret = null;
        const done = (error: string | null | unknown, secret?: string) => {
            actualError = error;
            actualSecret = secret;
        };

        await getSecret(instance(mockedRequest), "str", done);

        expect(actualError).toBeNull();
        expect(actualSecret).toBe("a secret");
    });
});

describe("getToken", () => {
    test("no token, no cookie", () => {
        jest.spyOn(ExtractJwt, "fromAuthHeaderAsBearerToken").mockImplementation(() => (_) => null);

        expect(getToken(instance(mockedRequest))).toBeNull();
    });

    test("no token, cookie", () => {
        jest.spyOn(ExtractJwt, "fromAuthHeaderAsBearerToken").mockImplementation(() => (_) => null);

        when(mockedRequest.cookies).thenReturn({ jwt: "jwt from cookie" });

        expect(getToken(instance(mockedRequest))).toBe("jwt from cookie");
    });

    test("token", () => {
        jest.spyOn(ExtractJwt, "fromAuthHeaderAsBearerToken").mockImplementation(
            () => (_) => "my jwt",
        );

        expect(getToken(instance(mockedRequest))).toBe("my jwt");
    });
});
