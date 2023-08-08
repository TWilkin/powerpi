import { FileService } from "@powerpi/common";
import { instance, mock, when } from "ts-mockito";
import ConfigService from "../../src/services/ConfigService";

const mockedFileService = mock<FileService>();

describe("ConfigService", () => {
    const oldEnv = process.env;

    let subject: ConfigService | undefined;

    beforeEach(() => {
        jest.resetModules();
        process.env = { ...oldEnv };

        subject = new ConfigService(instance(mockedFileService));
    });

    afterAll(() => {
        process.env = oldEnv;
    });

    test("service", () => expect(subject?.service).toBe("@powerpi/api"));

    test("version", () => expect(subject?.version).not.toBeNull());

    test("getUsedConfig", () =>
        expect(subject?.getUsedConfig()).toStrictEqual(["devices", "users"]));

    test("configIsNeeded", () => expect(subject?.configIsNeeded).toBeTruthy());

    test("externalHostName", () => {
        process.env.EXTERNAL_HOST_NAME = "domain.com";

        expect(subject?.externalHostName).toBe("domain.com");
    });

    test("externalPort", () => {
        process.env.EXTERNAL_PORT = "2345";

        expect(subject?.externalPort).toBe("2345");
    });

    describe("usesHttps", () => {
        test("default", () => {
            process.env.USE_HTTP = undefined;

            expect(subject?.usesHttps).toBeFalsy();
        });

        test("value", () => {
            process.env.USE_HTTP = "false";

            expect(subject?.usesHttps).toBeTruthy();
        });
    });

    describe("externalUrlBase", () => {
        process.env.EXTERNAL_HOST_NAME = "domain.com";
        process.env.EXTERNAL_PORT = "2345";

        test("http", () => {
            process.env.USE_HTTP = "true";

            expect(subject?.externalUrlBase).toBe("http://domain.com:2345");
        });

        test("https", () => {
            process.env.USE_HTTP = "false";

            expect(subject?.externalUrlBase).toBe("https://domain.com:2345");
        });
    });

    test("getAuthConfig", async () => {
        process.env.OAUTH_CLIENT_ID = "oauth id";
        process.env.OAUTH_SECRET_FILE = "oauth/secret/path";
        process.env.GOOGLE_CLIENT_ID = "google id";
        process.env.GOOGLE_SECRET_FILE = "google/secret/path";

        when(mockedFileService.read("oauth/secret/path")).thenResolve(
            Buffer.from("oauth secret content"),
        );

        when(mockedFileService.read("google/secret/path")).thenResolve(
            Buffer.from("google secret content"),
        );

        const result = await subject?.getAuthConfig();
        expect(result).not.toBeNull();
        expect(result).toHaveLength(2);

        const oauth = result?.find((config) => config.name === "oauth");
        expect(oauth).not.toBeNull();
        expect(oauth?.clientId).toBe("oauth id");
        expect(oauth?.clientSecret).toBe("oauth secret content");

        const google = result?.find((config) => config.name === "google");
        expect(google).not.toBeNull();
        expect(google?.clientId).toBe("google id");
        expect(google?.clientSecret).toBe("google secret content");
    });

    test("getJWTSecret", async () => {
        process.env.JWT_SECRET_FILE = "jwt/secret/path";

        when(mockedFileService.read("jwt/secret/path")).thenResolve(
            Buffer.from("jwt secret content"),
        );

        const result = await subject?.getJWTSecret();
        expect(result).toBe("jwt secret content");
    });

    test("getSessionSecret", async () => {
        process.env.SESSION_SECRET_FILE = "session/secret/path";

        when(mockedFileService.read("session/secret/path")).thenResolve(
            Buffer.from("session secret content"),
        );

        const result = await subject?.getSessionSecret();
        expect(result).toBe("session secret content");
    });

    describe("hasPersistence", () => {
        test("true", async () => {
            process.env.DB_SECRET_FILE = "db/secret/path";

            when(mockedFileService.read("db/secret/path")).thenResolve(
                Buffer.from("db secret content"),
            );

            const result = await subject?.hasPersistence();
            expect(result).toBeTruthy();
        });

        test("false", async () => {
            const result = await subject?.hasPersistence();
            expect(result).toBeFalsy();
        });
    });
});
