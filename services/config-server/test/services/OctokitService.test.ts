import octokit, { Octokit } from "@octokit/rest";
import { FileService } from "@powerpi/common";
import ConfigService from "../../src/services/ConfigService";
import OctokitService, { NoUserError } from "../../src/services/OctokitService";

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

describe("OctokitService", () => {
    let subject: OctokitService | undefined;

    beforeEach(() => {
        jest.mocked(Octokit).mockClear();

        jest.spyOn(ConfigService.prototype, "gitHubUser", "get").mockReturnValue("user");
        jest.spyOn(ConfigService.prototype, "repo", "get").mockReturnValue("repo");
        jest.spyOn(ConfigService.prototype, "branch", "get").mockReturnValue("branch");
        jest.spyOn(ConfigService.prototype, "path", "get").mockReturnValue("path/to");
        jest.spyOn(ConfigService.prototype, "gitHubToken", "get").mockResolvedValue("token");

        subject = new OctokitService(new ConfigService(new FileService()));
    });

    describe("getContent", () => {
        test("no user", () => {
            jest.spyOn(ConfigService.prototype, "gitHubUser", "get").mockReturnValue(undefined);

            const action = () => subject?.getContent();

            expect(action).rejects.toThrow(NoUserError);
        });

        [undefined, "devices.json"].forEach((fileName) =>
            test(`gets content(${fileName})`, async () => {
                const result = await subject?.getContent(fileName);

                expect(octokit.Octokit).toHaveBeenCalledTimes(1);

                expect(result).not.toBeNull();
                expect(result).toBe("I am file");
            }),
        );

        test("no second login", async () => {
            await subject?.getContent("devices.json");
            await subject?.getContent("devices.json");

            expect(octokit.Octokit).toHaveBeenCalledTimes(1);
        });
    });

    describe("getUrl", () => {
        test("no user", () => {
            jest.spyOn(ConfigService.prototype, "gitHubUser", "get").mockReturnValue(undefined);

            expect(subject?.getUrl()).toBe("github://unknown/repo/branch/path/to");
        });

        test("with fileName", () =>
            expect(subject?.getUrl("devices.json")).toBe(
                "github://user/repo/branch/path/to/devices.json",
            ));

        test("without fileName", () =>
            expect(subject?.getUrl()).toBe("github://user/repo/branch/path/to"));
    });
});
