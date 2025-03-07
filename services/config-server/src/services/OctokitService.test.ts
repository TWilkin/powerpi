import octokit, { Octokit } from "@octokit/rest";
import { instance, mock, when } from "ts-mockito";
import ConfigService from "./ConfigService.js";
import OctokitService, { NoUserError } from "./OctokitService.js";

vi.mock("@octokit/rest", () => {
    return {
        Octokit: vi.fn().mockImplementation(() => ({
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

const mockedConfigService = mock<ConfigService>();

describe("OctokitService", () => {
    let subject: OctokitService | undefined;

    beforeEach(() => {
        vi.mocked(Octokit).mockClear();

        when(mockedConfigService.gitHubUser).thenReturn("user");
        when(mockedConfigService.repo).thenReturn("repo");
        when(mockedConfigService.branch).thenReturn("branch");
        when(mockedConfigService.path).thenReturn("path/to");
        when(mockedConfigService.gitHubToken).thenResolve("token");

        subject = new OctokitService(instance(mockedConfigService));
    });

    describe("getContent", () => {
        test("no user", async () => {
            when(mockedConfigService.gitHubUser).thenReturn(undefined);

            const action = () => subject?.getContent();

            await expect(action).rejects.toThrow(NoUserError);
        });

        [undefined, "devices.json"].forEach((fileName) =>
            test(`gets content '${fileName}'`, async () => {
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
            when(mockedConfigService.gitHubUser).thenReturn(undefined);

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
