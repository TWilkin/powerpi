import { LoggerService } from "@powerpi/common";
import { capture, instance, mock, resetCalls, when } from "ts-mockito";
import ConfigPublishService from "../../src/services/ConfigPublishService";
import ConfigService from "../../src/services/ConfigService";
import ConfigServiceArgumentService from "../../src/services/ConfigServiceArgumentService";
import GitHubConfigService from "../../src/services/GitHubConfigService";
import OctokitService from "../../src/services/OctokitService";
import ValidatorService from "../../src/services/ValidatorService";
import HandlerFactory from "../../src/services/handlers/HandlerFactory";

const mockedConfigPublishService = mock<ConfigPublishService>();
const mockedHandlerFactory = mock<HandlerFactory>();
const mockedValidatorService = mock<ValidatorService>();
const mockedOctokitService = mock<OctokitService>();
const mockedConfigService = mock<ConfigService>();
const mockedConfigServiceArgumentService = mock<ConfigServiceArgumentService>();
const mockedLoggerService = mock<LoggerService>();

describe("GitHubConfigService", () => {
    let subject: GitHubConfigService | undefined;

    beforeEach(() => {
        jest.spyOn(process, "exit").mockImplementation(() => {
            throw new Error("terminated");
        });

        when(mockedConfigServiceArgumentService.options).thenReturn({ daemon: false });
        when(mockedConfigService.pollFrequency).thenReturn(300);
        when(mockedOctokitService.getUrl()).thenReturn("github://");

        subject = new GitHubConfigService(
            instance(mockedConfigPublishService),
            instance(mockedHandlerFactory),
            instance(mockedValidatorService),
            instance(mockedOctokitService),
            instance(mockedConfigService),
            instance(mockedConfigServiceArgumentService),
            instance(mockedLoggerService),
        );
    });

    describe("start", () => {
        describe("daemon", () => {
            test("on", async () => {
                jest.useFakeTimers();

                when(mockedConfigServiceArgumentService.options).thenReturn({ daemon: true });

                // doesn't throw
                await subject?.start();

                let logs = capture(mockedLoggerService.info);

                expect(logs.first()).toContainLogMessage("Listing contents of github://");
                expect(logs.last()).toContainLogMessage("Scheduling to run every 300 seconds");
                resetCalls(mockedLoggerService);

                await jest.advanceTimersByTimeAsync(300 * 1000 + 10);

                logs = capture(mockedLoggerService.info);

                expect(logs.last()).toContainLogMessage("Listing contents of github://");
            });

            test("off", async () => {
                const action = subject?.start();

                await expect(action).rejects.toThrow(Error);
            });
        });
    });
});
