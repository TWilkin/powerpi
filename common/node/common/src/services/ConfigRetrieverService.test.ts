import { ConfigFileType, ConfigService, FileService, LoggerService, MqttService } from "../../src";
import { ConfigRetrieverService } from "../../src/services/ConfigRetrieverService";

describe("ConfigRetrieverService", () => {
    let subject: ConfigRetrieverService;

    beforeEach(() => {
        const fs = new FileService();
        const config = new ConfigService(fs);
        const logger = new LoggerService(config);
        const mqtt = new MqttService(config, logger);

        jest.spyOn(MqttService.prototype, "subscribe").mockImplementation(
            (_) => new Promise((resolve) => resolve()),
        );

        subject = new ConfigRetrieverService(config, mqtt, logger);
    });

    describe("start", () => {
        test("no wait", async () => {
            jest.spyOn(ConfigService.prototype, "configIsNeeded", "get").mockReturnValue(false);

            await subject.start();
        });

        test("timeout", async () => {
            jest.useFakeTimers();

            jest.spyOn(ConfigService.prototype, "configIsNeeded", "get").mockReturnValue(true);

            jest.spyOn(ConfigService.prototype, "isPopulated", "get").mockReturnValue(false);

            jest.spyOn(ConfigService.prototype, "configWaitTime", "get").mockReturnValue(2);

            jest.advanceTimersByTimeAsync(2 * 1000);

            await expect(subject.start).rejects.toThrow();
        });

        test("success", async () => {
            jest.spyOn(ConfigService.prototype, "configIsNeeded", "get").mockReturnValue(true);

            jest.spyOn(ConfigService.prototype, "isPopulated", "get").mockReturnValue(true);

            await subject.start();
        });
    });

    describe("message", () => {
        const setConfig = jest.spyOn(ConfigService.prototype, "setConfig");

        beforeEach(() => setConfig.mockClear());

        [
            [true, false, false],
            [false, true, false],
            [false, false, true],
        ].forEach((options) => {
            const [isNeeded, usedConfig, hasConfig] = options;

            test(`not required ${isNeeded} ${usedConfig} ${hasConfig}`, () => {
                const listener = {
                    onConfigChange: jest.fn(),
                };

                subject.addListener(ConfigFileType.Users, listener);

                jest.spyOn(ConfigService.prototype, "configIsNeeded", "get").mockReturnValue(
                    isNeeded,
                );

                const used = [ConfigFileType.Devices];
                if (usedConfig) {
                    used.push(ConfigFileType.Users);
                }
                jest.spyOn(ConfigService.prototype, "getUsedConfig").mockReturnValue(used);

                if (hasConfig) {
                    jest.spyOn(ConfigService.prototype, "getConfig").mockReturnValue({
                        data: [],
                        checksum: "checky",
                    });
                }

                subject.message("config", "users", "change", {
                    payload: { users: ["tom"] },
                    checksum: "checky",
                });

                expect(setConfig).toHaveBeenCalledTimes(1);
                expect(setConfig).toHaveBeenCalledWith("users", { users: ["tom"] }, "checky");

                expect(listener.onConfigChange).toHaveBeenCalledWith(ConfigFileType.Users);
            });
        });
    });

    describe("listeners", () => {
        test("add and remove", () => {
            const listener = {
                onConfigChange: jest.fn(),
            };

            subject.addListener(ConfigFileType.Users, listener);

            // it is called with the right type
            subject.message("config", "users", "change", { payload: {}, checksum: "checky" });
            expect(listener.onConfigChange).toHaveBeenCalledWith(ConfigFileType.Users);

            // it's not called with the wrong type
            listener.onConfigChange.mockReset();
            subject.message("config", "devices", "change", { payload: {}, checksum: "checky" });
            expect(listener.onConfigChange).not.toHaveBeenCalledWith(ConfigFileType.Users);

            // removing it stops it being called
            listener.onConfigChange.mockReset();
            subject.removeListener(ConfigFileType.Users, listener);
            subject.message("config", "users", "change", { payload: {}, checksum: "checky" });
            expect(listener.onConfigChange).not.toHaveBeenCalledWith(ConfigFileType.Users);
        });
    });
});
