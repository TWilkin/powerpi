import { jest } from "@jest/globals";
import { FileService, LoggerService, MqttService } from "@powerpi/common";
import { MockLoggerService } from "@powerpi/common-test";
import ConfigService from "./ConfigService.js";
import HealthService from "./HealthService.js";

describe("HealthService", () => {
    let subject: HealthService;

    beforeEach(() => {
        const config = new ConfigService(new FileService());
        const logger = new MockLoggerService() as unknown as LoggerService;

        subject = new HealthService(new MqttService(config, logger), logger);
    });

    describe("execute", () => {
        test("success", () => {
            jest.spyOn(MqttService.prototype, "connected", "get").mockReturnValue(true);

            const result = subject.execute();

            expect(result).toBeTruthy();
        });

        test("failure", () => {
            jest.spyOn(MqttService.prototype, "connected", "get").mockReturnValue(false);

            const result = subject.execute();

            expect(result).toBeFalsy();
        });
    });
});
