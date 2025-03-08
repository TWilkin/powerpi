import { ConfigFileType, IDeviceConfigFile, LoggerService } from "@powerpi/common";
import { anything, capture, instance, mock, resetCalls, verify, when } from "ts-mockito";
import ConfigPublishService from "./ConfigPublishService.js";
import ConfigService from "./ConfigService.js";
import ConfigServiceArgumentService from "./ConfigServiceArgumentService.js";
import GitHubConfigService from "./GitHubConfigService.js";
import OctokitService from "./OctokitService.js";
import ValidatorService from "./ValidatorService.js";
import HandlerFactory from "./handlers/HandlerFactory.js";
import IHandler from "./handlers/IHandler.js";

type OctokitContent = Awaited<ReturnType<OctokitService["getContent"]>>;

const mockedConfigPublishService = mock<ConfigPublishService>();
const mockedHandlerFactory = mock<HandlerFactory>();
const mockedValidatorService = mock<ValidatorService>();
const mockedOctokitService = mock<OctokitService>();
const mockedConfigService = mock<ConfigService>();
const mockedConfigServiceArgumentService = mock<ConfigServiceArgumentService>();
const mockedLoggerService = mock<LoggerService>();
const mockedHandler = mock<IHandler<IDeviceConfigFile>>();

describe("GitHubConfigService", () => {
    let subject: GitHubConfigService | undefined;

    beforeEach(() => {
        vi.spyOn(process, "exit").mockImplementation(() => {
            throw new ProcessExitCalled();
        });

        when(mockedConfigServiceArgumentService.options).thenReturn({ daemon: false });
        when(mockedConfigService.pollFrequency).thenReturn(300);
        when(mockedOctokitService.getUrl()).thenReturn("github://");

        resetCalls(mockedLoggerService);
        resetCalls(mockedOctokitService);
        resetCalls(mockedValidatorService);
        resetCalls(mockedConfigPublishService);

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
                vi.useFakeTimers();

                when(mockedConfigServiceArgumentService.options).thenReturn({ daemon: true });

                // doesn't throw
                await subject?.start();

                let logs = capture(mockedLoggerService.info);

                expect(logs.first()).toContainLogMessage("Listing contents of github://");
                expect(logs.last()).toContainLogMessage("Scheduling to run every 300 seconds");
                resetCalls(mockedLoggerService);

                await vi.advanceTimersByTimeAsync(300 * 1000 + 10);

                logs = capture(mockedLoggerService.info);

                expect(logs.last()).toContainLogMessage("Listing contents of github://");
            });

            test("off", async () => {
                const action = subject?.start();

                await expect(action).rejects.toThrow(ProcessExitCalled);
            });
        });

        describe("downloads files", () => {
            test("no files", async () => {
                when(mockedConfigService.configFileTypes).thenReturn([
                    ConfigFileType.Devices,
                    ConfigFileType.Events,
                ]);

                when(mockedOctokitService.getContent()).thenResolve([
                    {
                        name: "other.thing",
                    },
                ] as unknown as OctokitContent);

                const action = subject?.start();

                await expect(action).rejects.toThrow(ProcessExitCalled);

                const logs = capture(mockedLoggerService.warn);

                expect(logs.first()).toContainLogMessage("No file found for devices");
                expect(logs.second()).toContainLogMessage("No file found for events");
            });

            test("error", async () => {
                when(mockedConfigService.configFileTypes).thenReturn([ConfigFileType.Users]);

                when(mockedOctokitService.getContent()).thenResolve([
                    {
                        name: "users.yml",
                    },
                ] as unknown as OctokitContent);

                when(mockedOctokitService.getContent("users.yml")).thenReject(new Error("Nope"));

                const action = subject?.start();

                await expect(action).rejects.toThrow(ProcessExitCalled);

                const logs = capture(mockedLoggerService.error);

                expect(logs.second()).toContainLogMessage(
                    "Could not retrieve users.yml from GitHub",
                );
            });

            test("changes", async () => {
                when(mockedConfigService.configFileTypes).thenReturn([
                    ConfigFileType.Devices,
                    ConfigFileType.Events,
                    ConfigFileType.Users,
                ]);

                // devices.yaml is changed
                when(mockedConfigService.getConfig(ConfigFileType.Devices)).thenReturn({
                    data: {},
                    checksum: "checksum_old_d",
                });

                // events.json is unchanged
                when(mockedConfigService.getConfig(ConfigFileType.Events)).thenReturn({
                    data: {},
                    checksum: "checksum_e",
                });

                // users.yml is changed
                when(mockedConfigService.getConfig(ConfigFileType.Users)).thenReturn({
                    data: {},
                    checksum: "checksum_old_u",
                });

                when(mockedOctokitService.getContent()).thenResolve([
                    { name: "devices.yaml" },
                    { name: "events.json" },
                    { name: "users.yml" },
                ] as unknown as OctokitContent);

                when(mockedOctokitService.getContent("devices.yaml")).thenResolve({
                    content: Buffer.from("devices:[]\nsensors:[]", "binary").toString("base64"),
                    sha: "checksum_d",
                } as unknown as OctokitContent);

                when(mockedOctokitService.getContent("events.json")).thenResolve({
                    content: Buffer.from('{"listeners": []}', "binary").toString("base64"),
                    sha: "checksum_e",
                } as unknown as OctokitContent);

                when(mockedOctokitService.getContent("users.yml")).thenResolve({
                    content: Buffer.from("users:[]", "binary").toString("base64"),
                    sha: "checksum_u",
                } as unknown as OctokitContent);

                when(mockedValidatorService.validate(anything(), anything())).thenResolve(true);

                when(mockedHandlerFactory.build(ConfigFileType.Devices)).thenReturn(
                    instance(mockedHandler),
                );

                const action = subject?.start();

                await expect(action).rejects.toThrow(ProcessExitCalled);

                verify(mockedOctokitService.getContent("devices.yaml")).once();
                verify(mockedOctokitService.getContent("events.json")).once();
                verify(mockedOctokitService.getContent("users.yml")).once();

                verify(mockedValidatorService.validate(ConfigFileType.Devices, anything())).once();
                verify(mockedValidatorService.validate(ConfigFileType.Events, anything())).once();
                verify(mockedValidatorService.validate(ConfigFileType.Users, anything())).once();

                // only the device and user file was changed
                verify(
                    mockedConfigPublishService.publishConfigChange(
                        ConfigFileType.Devices,
                        anything(),
                        "checksum_d",
                    ),
                ).once();
                verify(
                    mockedConfigPublishService.publishConfigChange(
                        ConfigFileType.Events,
                        anything(),
                        "checksum_e",
                    ),
                ).never();
                verify(
                    mockedConfigPublishService.publishConfigChange(
                        ConfigFileType.Users,
                        anything(),
                        "checksum_u",
                    ),
                ).once();

                // we call the handler but only for device
                verify(mockedHandlerFactory.build(anything())).twice();
                verify(mockedHandler.handle(anything())).once();
            });

            test("changes, unseen file", async () => {
                when(mockedConfigService.configFileTypes).thenReturn([ConfigFileType.Devices]);

                // devices.yaml is changed
                when(mockedConfigService.getConfig(ConfigFileType.Devices)).thenReturn(undefined);

                when(mockedOctokitService.getContent()).thenResolve([
                    { name: "devices.yaml" },
                ] as unknown as OctokitContent);

                when(mockedOctokitService.getContent("devices.yaml")).thenResolve({
                    content: Buffer.from("devices:[]\nsensors:[]", "binary").toString("base64"),
                    sha: "checksum_d",
                } as unknown as OctokitContent);

                when(mockedValidatorService.validate(anything(), anything())).thenResolve(true);

                const action = subject?.start();

                await expect(action).rejects.toThrow(ProcessExitCalled);

                verify(mockedOctokitService.getContent("devices.yaml")).once();

                verify(mockedValidatorService.validate(ConfigFileType.Devices, anything())).once();

                verify(
                    mockedConfigPublishService.publishConfigChange(
                        ConfigFileType.Devices,
                        anything(),
                        "checksum_d",
                    ),
                ).once();
            });
        });

        describe("validation", () => {
            test("fails", async () => {
                when(mockedConfigService.configFileTypes).thenReturn([ConfigFileType.Events]);

                // events.json is changed
                when(mockedConfigService.getConfig(ConfigFileType.Events)).thenReturn({
                    data: {},
                    checksum: "checksum_old_e",
                });

                when(mockedOctokitService.getContent()).thenResolve([
                    { name: "events.json" },
                ] as unknown as OctokitContent);

                when(mockedOctokitService.getContent("events.json")).thenResolve({
                    content: Buffer.from('{"listeners": []}', "binary").toString("base64"),
                    sha: "checksum_e",
                } as unknown as OctokitContent);

                when(mockedValidatorService.validate(anything(), anything())).thenResolve(false);

                const action = subject?.start();

                await expect(action).rejects.toThrow(ProcessExitCalled);

                verify(mockedOctokitService.getContent("events.json")).once();

                verify(mockedValidatorService.validate(ConfigFileType.Events, anything())).once();

                // validation so only errors are published
                verify(
                    mockedConfigPublishService.publishConfigChange(
                        ConfigFileType.Events,
                        anything(),
                        "checksum_e",
                    ),
                ).never();

                verify(
                    mockedConfigPublishService.publishConfigError(
                        ConfigFileType.Events,
                        anything(),
                        anything(),
                    ),
                ).once();
            });
        });
    });
});

class ProcessExitCalled extends Error {}
