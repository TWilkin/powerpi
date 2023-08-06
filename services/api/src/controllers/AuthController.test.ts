import crypto from "crypto";
import { Response } from "express";
import passport from "passport";
import {
    anyNumber,
    anyString,
    anything,
    instance,
    mock,
    resetCalls,
    verify,
    when,
} from "ts-mockito";
import { ConfigService, JwtService, UserService } from "../services";
import AuthController, { AuthSession } from "./AuthController";

const mockedConfigService = mock<ConfigService>();
const mockedJwtService = mock<JwtService>();
const mockedUserService = mock<UserService>();
const mockedSession = mock<AuthSession>();
const mockedResponse = mock<Response>();

describe("AuthController", () => {
    let subject: AuthController | undefined;

    beforeEach(() => {
        when(mockedResponse.status(anyNumber())).thenReturn(instance(mockedResponse));

        resetCalls(mockedUserService);
        resetCalls(mockedResponse);

        subject = new AuthController(
            instance(mockedConfigService),
            instance(mockedJwtService),
            instance(mockedUserService),
        );
    });

    describe("google", () => {
        describe("clientId", () => {
            test("success", async () => {
                const passportSpy = jest.spyOn(passport, "authenticate");

                when(mockedConfigService.getAuthConfig()).thenResolve([
                    {
                        name: "other",
                        clientId: "else",
                        clientSecret: "blah",
                    },
                    {
                        name: "oauth",
                        clientId: "match",
                        clientSecret: "blah",
                    },
                ]);

                await subject?.google(
                    instance(mockedSession),
                    "",
                    "",
                    "",
                    "match",
                    instance(mockedResponse),
                );

                expect(passportSpy).toHaveBeenCalledWith("google", {
                    scope: ["profile", "email"],
                    session: false,
                });
            });

            test("bad", async () => {
                when(mockedConfigService.getAuthConfig()).thenResolve([
                    {
                        name: "oauth",
                        clientId: "else",
                        clientSecret: "blah",
                    },
                ]);

                await subject?.google(
                    instance(mockedSession),
                    "",
                    "",
                    "",
                    "wrong",
                    instance(mockedResponse),
                );

                verify(mockedResponse.status(403)).once();
            });

            test("missing", async () => {
                when(mockedConfigService.getAuthConfig()).thenResolve([
                    {
                        name: "other",
                        clientId: "else",
                        clientSecret: "blah",
                    },
                ]);

                await subject?.google(
                    instance(mockedSession),
                    "",
                    "",
                    "",
                    "match",
                    instance(mockedResponse),
                );

                verify(mockedResponse.status(403)).once();
            });

            describe("session", () => {
                when(mockedConfigService.getAuthConfig()).thenResolve([
                    {
                        name: "oauth",
                        clientId: "else",
                        clientSecret: "blah",
                    },
                ]);

                test("redirectUri no state", async () => {
                    const session = {} as AuthSession;

                    await subject?.google(
                        session,
                        "http://place.com",
                        "",
                        "",
                        "",
                        instance(mockedResponse),
                    );

                    expect(session.redirectUri).toBe("http://place.com");
                });

                test("redirectUri state", async () => {
                    const session = {} as AuthSession;

                    await subject?.google(
                        session,
                        "http://place.com",
                        "",
                        "exploding",
                        "",
                        instance(mockedResponse),
                    );

                    expect(session.redirectUri).toBe("http://place.com?state=exploding");
                });

                [
                    { responseType: "code", expected: true },
                    { responseType: "something", expected: false },
                ].forEach(({ responseType, expected }) =>
                    test(`responseType=${responseType}`, async () => {
                        const session = {
                            useCode: false,
                        } as AuthSession;

                        await subject?.google(
                            session,
                            "",
                            responseType,
                            "",
                            "",
                            instance(mockedResponse),
                        );

                        expect(session.useCode).toBe(expected);
                    }),
                );
            });
        });
    });

    describe("googleCallback", () => {
        describe("useCode=true", () => {
            [
                {
                    redirectUri: "http://place.com",
                    expected: "http://place.com?code=1234",
                },
                {
                    redirectUri: "http://place.com?something=else",
                    expected: "http://place.com?something=else&code=1234",
                },
            ].forEach(({ redirectUri, expected }) =>
                test(redirectUri, async () => {
                    jest.spyOn(crypto, "randomBytes").mockImplementation((_) => "1234");

                    await subject?.googleCallback(
                        { email: "user@user.com", role: "USER" },
                        redirectUri,
                        true,
                        instance(mockedResponse),
                    );

                    verify(mockedUserService.pushUser("1234", anything())).once();

                    verify(mockedResponse.redirect(expected));
                }),
            );
        });

        test("useCode=false", async () => {
            when(mockedJwtService.createJWT(anything(), "google")).thenResolve("my jwt");

            when(mockedJwtService.parse("my jwt")).thenResolve({
                email: "user@user.com",
                provider: "google",
                iat: 1,
                exp: 1234,
                aud: "audience",
                iss: "issuer",
                sub: "subject",
            });

            await subject?.googleCallback(
                { email: "user@user.com", role: "USER" },
                "",
                false,
                instance(mockedResponse),
            );

            verify(mockedResponse.cookie("jwt", "my jwt", anything())).once();

            verify(mockedResponse.redirect(anyString())).never();
        });
    });

    describe("googleToken", () => {
        test("no user", async () => {
            await subject?.googleToken("1234", instance(mockedResponse));

            verify(mockedResponse.status(403)).once();
        });

        test("user", async () => {
            when(mockedUserService.popUser("1234")).thenReturn({
                email: "user@user.com",
                subject: "subject",
            });

            when(mockedJwtService.createJWT(anything(), "google")).thenResolve("my jwt");

            when(mockedJwtService.parse("my jwt")).thenResolve({
                email: "user@user.com",
                provider: "google",
                iat: 1,
                exp: new Date().getTime() / 1000,
                aud: "audience",
                iss: "issuer",
                sub: "subject",
            });

            const result = await subject?.googleToken("1234", instance(mockedResponse));

            expect(result).toBeDefined();
            expect(result?.access_token).toBe("my jwt");
            expect(result?.token_type).toBe("bearer");
            expect(result?.expires_in).toBeCloseTo(0);
        });
    });
});
