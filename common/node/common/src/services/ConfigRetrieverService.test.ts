import { vi } from "vitest";
import { ConfigRetrieverService } from "./ConfigRetrieverService.js";
import { ConfigFileType, ConfigService } from "./ConfigService.js";
import FileService from "./FileService.js";
import { LoggerService } from "./LoggerService.js";
import { MqttService } from "./MqttService.js";

describe("ConfigRetrieverService", () => {
    let subject: ConfigRetrieverService;

    beforeEach(() => {
        const fs = new FileService();
        const config = new ConfigService(fs);
        const logger = new LoggerService(config);
        const mqtt = new MqttService(config, logger);

        vi.spyOn(MqttService.prototype, "subscribe").mockImplementation(
            (_) => new Promise((resolve) => resolve()),
        );

        subject = new ConfigRetrieverService(config, mqtt, logger);
    });

    describe("start", () => {
        test("no wait", async () => {
            vi.spyOn(ConfigService.prototype, "configIsNeeded", "get").mockReturnValue(false);

            await subject.start();
        });

        test("timeout", async () => {
            vi.useFakeTimers();

            vi.spyOn(ConfigService.prototype, "configIsNeeded", "get").mockReturnValue(true);

            vi.spyOn(ConfigService.prototype, "isPopulated", "get").mockReturnValue(false);

            vi.spyOn(ConfigService.prototype, "configWaitTime", "get").mockReturnValue(2);

            vi.advanceTimersByTimeAsync(2 * 1000);

            await expect(subject.start).rejects.toThrow();
        });

        test("success", async () => {
            vi.spyOn(ConfigService.prototype, "configIsNeeded", "get").mockReturnValue(true);

            vi.spyOn(ConfigService.prototype, "isPopulated", "get").mockReturnValue(true);

            await subject.start();
        });
    });

    describe("message", () => {
        [
            [true, false, false],
            [false, true, false],
            [false, false, true],
        ].forEach((options) => {
            const [isNeeded, usedConfig, hasConfig] = options;

            test(`not required ${isNeeded} ${usedConfig} ${hasConfig}`, () => {
                const setConfig = vi.spyOn(ConfigService.prototype, "setConfig");

                const listener = {
                    onConfigChange: vi.fn(),
                };

                subject.addListener(ConfigFileType.Users, listener);

                vi.spyOn(ConfigService.prototype, "configIsNeeded", "get").mockReturnValue(
                    isNeeded,
                );

                const used = [ConfigFileType.Devices];
                if (usedConfig) {
                    used.push(ConfigFileType.Users);
                }
                vi.spyOn(ConfigService.prototype, "getUsedConfig").mockReturnValue(used);

                if (hasConfig) {
                    vi.spyOn(ConfigService.prototype, "getConfig").mockReturnValue({
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
                onConfigChange: vi.fn(),
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
