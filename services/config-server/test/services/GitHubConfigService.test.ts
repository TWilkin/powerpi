import { LogParameter, LoggerService } from "@powerpi/common";
import ConfigPublishService from "../../src/services/ConfigPublishService";
import ConfigService from "../../src/services/ConfigService";
import ConfigServiceArgumentService from "../../src/services/ConfigServiceArgumentService";
import GitHubConfigService from "../../src/services/GitHubConfigService";
import OctokitService from "../../src/services/OctokitService";
import ValidatorService from "../../src/services/ValidatorService";
import HandlerFactory from "../../src/services/handlers/HandlerFactory";

jest.mock("../../src/services/ConfigPublishService");
jest.mock("../../src/services/handlers/HandlerFactory");
jest.mock("../../src/services/ValidatorService");
jest.mock("../../src/services/OctokitService");
jest.mock("../../src/services/ConfigService");
jest.mock("../../src/services/ConfigServiceArgumentService");
jest.mock("@powerpi/common");

const ConfigPublishServiceMock = ConfigPublishService as unknown as jest.Mock<ConfigPublishService>;
const HandlerFactoryMock = <jest.Mock<HandlerFactory>>HandlerFactory;
const ValidatorServiceMock = <jest.Mock<ValidatorService>>ValidatorService;
const OctokitServiceMock = <jest.Mock<OctokitService>>OctokitService;
const ConfigServiceMock = <jest.Mock<ConfigService>>ConfigService;
const ConfigServiceArgumentServiceMock = <jest.Mock<ConfigServiceArgumentService>>(
    ConfigServiceArgumentService
);
const LoggerServiceMock = LoggerService as unknown as jest.Mock<LoggerService>;

describe("GitHubConfigService", () => {
    beforeEach(() => {
        jest.spyOn(process, "exit").mockImplementation(() => {
            throw new Error("terminated");
        });
    });

    describe("start", () => {
        describe("daemon", () => {
            test("on", async () => {
                jest.useFakeTimers();

                const subject = createSubject(true);

                const logger = jest.mocked(LoggerService).mock.instances[0];
                const info = jest.mocked(logger.info);

                expect(info.mock.calls).toHaveLength(0);

                // doesn't throw
                await subject.start();

                expectLogMessage(info.mock.calls, "Listing contents of github://");
                expectLogMessage(info.mock.calls, "Scheduling to run every 300 seconds");
                info.mockClear();

                await jest.advanceTimersByTimeAsync(300 * 1000 + 10);

                expectLogMessage(info.mock.calls, "Listing contents of github://");
            });

            test("off", async () => {
                const subject = createSubject(false);

                const action = subject.start();

                await expect(action).rejects.toThrow(Error);
            });
        });
    });
});

function createSubject(daemon: boolean) {
    ConfigServiceArgumentServiceMock.mockImplementation(
        () =>
            ({
                options: {
                    daemon,
                },
            }) as ConfigServiceArgumentService,
    );

    ConfigServiceMock.mockImplementation(
        () =>
            ({
                pollFrequency: 300,
            }) as ConfigService,
    );

    OctokitServiceMock.mockImplementation(
        () =>
            ({
                getUrl: () => "github://",
            }) as OctokitService,
    );

    return new GitHubConfigService(
        new ConfigPublishServiceMock(),
        new HandlerFactoryMock(),
        new ValidatorServiceMock(),
        new OctokitServiceMock(),
        new ConfigServiceMock(),
        new ConfigServiceArgumentServiceMock(),
        new LoggerServiceMock(),
    );
}

function expectLogMessage(messages: LogParameter[][], expected: LogParameter) {
    const asStrings = messages.map((message) =>
        (message.reduce((str, part) => `${str} ${part}`, "") as string).trim(),
    );

    expect(asStrings.findIndex((message) => message === expected)).not.toBe(-1);
}
