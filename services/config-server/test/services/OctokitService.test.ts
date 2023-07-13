import octokit, { Octokit } from "@octokit/rest";
import ConfigService from "../../src/services/ConfigService";
import OctokitService, { NoUserError } from "../../src/services/OctokitService";

jest.mock("../../src/services/ConfigService");
jest.mock("@octokit/rest", () => {
    return {
        Octokit: jest.fn().mockImplementation(() => ({
            rest: {
                repos: {
                    getContent: () => ({
                        data: "I am file",
                    }),
                },
            },
        })),
    };
});

const ConfigServiceMock = <jest.Mock<ConfigService>>ConfigService;

describe("OctokitService", () => {
    beforeEach(() => {
        jest.mocked(Octokit).mockClear();
    });

    describe("getContent", () => {
        test("no user", () => {
            const subject = createSubject(undefined);

            const action = () => subject.getContent();

            expect(action).rejects.toThrow(NoUserError);
        });

        [undefined, "devices.json"].forEach((fileName) =>
            test(`gets content '${fileName}'`, async () => {
                const subject = createSubject("user");
                const result = await subject.getContent(fileName);

                expect(octokit.Octokit).toHaveBeenCalledTimes(1);

                expect(result).not.toBeNull();
                expect(result).toBe("I am file");
            }),
        );

        test("no second login", async () => {
            const subject = createSubject("user");

            await subject.getContent("devices.json");
            await subject.getContent("devices.json");

            expect(octokit.Octokit).toHaveBeenCalledTimes(1);
        });
    });

    describe("getUrl", () => {
        test("no user", () => {
            const subject = createSubject(undefined);

            expect(subject?.getUrl()).toBe("github://unknown/repo/branch/path/to");
        });

        test("with fileName", () => {
            const subject = createSubject("user");

            expect(subject.getUrl("devices.json")).toBe(
                "github://user/repo/branch/path/to/devices.json",
            );
        });

        test("without fileName", () => {
            const subject = createSubject("user");

            expect(subject.getUrl()).toBe("github://user/repo/branch/path/to");
        });
    });
});

function createSubject(user: string | undefined) {
    ConfigServiceMock.mockImplementation(
        () =>
            ({
                gitHubUser: user,
                repo: "repo",
                branch: "branch",
                path: "path/to",
                gitHubToken: Promise.resolve("token"),
            }) as ConfigService,
    );

    return new OctokitService(new ConfigServiceMock());
}
