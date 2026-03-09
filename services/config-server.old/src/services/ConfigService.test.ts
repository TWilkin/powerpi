import { ConfigFileType, FileService } from "@powerpi/common";
import { instance, mock, when } from "ts-mockito";
import ConfigService from "./ConfigService.js";

const mockedFileService = mock<FileService>();

describe("ConfigService", () => {
    const oldEnv = process.env;

    let subject: ConfigService | undefined;

    beforeEach(() => {
        vi.resetModules();
        process.env = { ...oldEnv };

        subject = new ConfigService(instance(mockedFileService));
    });

    afterAll(() => {
        process.env = oldEnv;
    });

    test("service", () => expect(subject?.service).toBe("@powerpi/config-server"));

    test("version", () => expect(subject?.version).not.toBeNull());

    test("getUsedConfig", () => expect(subject?.getUsedConfig()).toHaveLength(0));

    test("configIsNeeded", () => expect(subject?.configIsNeeded).toBeFalsy());

    test("gitHubUser", () => {
        process.env.GITHUB_USER = "MsUser";

        expect(subject?.gitHubUser).toBe("MsUser");
    });

    test("gitHubToken", async () => {
        process.env.GITHUB_SECRET_FILE = "token/path";

        when(mockedFileService.read("token/path")).thenResolve(Buffer.from("token content"));

        const result = await subject?.gitHubToken;
        expect(result).toBe("token content");
    });

    describe("repo", () => {
        test("default", () => {
            process.env.REPO = undefined;

            expect(subject?.repo).toBe("powerpi-config");
        });

        test("value", () => {
            process.env.REPO = "MyConfigRepo";

            expect(subject?.repo).toBe("MyConfigRepo");
        });
    });

    describe("branch", () => {
        test("default", () => {
            process.env.BRANCH = undefined;
            expect(subject?.branch).toBe("main");
        });

        test("value", () => {
            process.env.BRANCH = "master";

            expect(subject?.branch).toBe("master");
        });
    });

    describe("path", () => {
        test("default", () => {
            process.env.FILE_PATH = undefined;

            expect(subject?.path).toBe("");
        });

        test("value", () => {
            process.env.FILE_PATH = "my/config/path";

            expect(subject?.path).toBe("my/config/path");
        });
    });

    describe("pollFrequency", () => {
        test("default", () => {
            process.env.POLL_FREQUENCY = undefined;

            expect(subject?.pollFrequency).toBe(300);
        });

        test("value", () => {
            process.env.POLL_FREQUENCY = "1234";

            expect(subject?.pollFrequency).toBe(1234);
        });
    });

    describe("configFileType", () => {
        test("default", () =>
            expect(subject?.configFileTypes).toStrictEqual(Object.values(ConfigFileType)));

        test("no schedule", () => {
            process.env.SCHEDULER_ENABLED = "false";

            expect(subject?.configFileTypes).not.toContain(ConfigFileType.Schedules);
        });

        test("no events", () => {
            process.env.EVENTS_ENABLED = "false";

            expect(subject?.configFileTypes).not.toContain(ConfigFileType.Events);
        });

        test("none", () => {
            process.env.SCHEDULER_ENABLED = "false";
            process.env.EVENTS_ENABLED = "false";

            expect(subject?.configFileTypes).not.toContain(ConfigFileType.Schedules);
            expect(subject?.configFileTypes).not.toContain(ConfigFileType.Events);
        });
    });

    describe("schedulerEnabled", () => {
        test("default", () => {
            process.env.SCHEDULER_ENABLED = undefined;

            expect(subject?.schedulerEnabled).toBeTruthy();
        });

        test("value", () => {
            process.env.SCHEDULER_ENABLED = "false";

            expect(subject?.schedulerEnabled).toBeFalsy();
        });
    });

    describe("eventsEnabled", () => {
        test("default", () => {
            process.env.EVENTS_ENABLED = undefined;

            expect(subject?.eventsEnabled).toBeTruthy();
        });

        test("value", () => {
            process.env.EVENTS_ENABLED = "false";

            expect(subject?.eventsEnabled).toBeFalsy();
        });
    });
});
