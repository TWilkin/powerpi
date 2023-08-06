import GoogleProtocol from "./GoogleProtocol";

import { Strategy } from "passport-google-oauth20";
import { instance, mock, when } from "ts-mockito";
import { ConfigService } from "../services";
import UserService from "../services/UserService";

const mockedConfigService = mock<ConfigService>();
const mockedUserService = mock<UserService>();

describe("GoogleProtocol", () => {
    let subject: GoogleProtocol | undefined;

    beforeEach(() => {
        subject = new GoogleProtocol(instance(mockedConfigService), instance(mockedUserService));
    });

    describe("$onVerify", () => {
        [
            { profile: { id: "no emails", emails: [] }, expected: false },
            {
                profile: {
                    id: "unverified",
                    emails: [{ value: "user@user.com", verified: false }],
                },
                expected: false,
            },
            {
                profile: {
                    id: "not matching",
                    emails: [
                        { value: "nope@user.com", verified: true },
                        { value: "noway@user.com", verified: true },
                    ],
                },
                expected: false,
            },
            {
                profile: {
                    id: "success",
                    emails: [{ value: "user@user.com", verified: true }],
                },
                expected: true,
            },
        ].forEach(({ profile, expected }) =>
            test(`${profile.id}`, async () => {
                when(mockedUserService.users).thenReturn([
                    { email: "someone@user.com" },
                    { email: "user@user.com" },
                ]);

                const result = await subject?.$onVerify("", profile);

                if (expected) {
                    expect(result).toStrictEqual({
                        email: "user@user.com",
                        subject: "success",
                    });
                } else {
                    expect(result).toBeFalsy();
                }
            }),
        );
    });

    describe("$onInstall", () => {
        test("no client", async () => {
            when(mockedConfigService.getAuthConfig()).thenResolve([
                { name: "oauth", clientId: "id", clientSecret: "secret" },
            ]);

            const action = () => subject?.$onInstall({} as Strategy);

            expect(action).rejects.toThrow();
        });

        test("client", async () => {
            when(mockedConfigService.getAuthConfig()).thenResolve([
                {
                    name: "oauth",
                    clientId: "else",
                    clientSecret: "blah",
                },
                {
                    name: "google",
                    clientId: "match",
                    clientSecret: "secretly",
                },
            ]);

            when(mockedConfigService.externalUrlBase).thenReturn("http://mydomain.com");

            const strategy = {
                _oauth2: {
                    _clientId: "",
                    _clientSecret: "",
                },
                _callbackURL: "",
            };

            await subject?.$onInstall(strategy as unknown as Strategy);

            expect(strategy._oauth2._clientId).toBe("match");
            expect(strategy._oauth2._clientSecret).toBe("secretly");
            expect(strategy._callbackURL).toBe("http://mydomain.com/api/auth/google/callback");
        });
    });
});
