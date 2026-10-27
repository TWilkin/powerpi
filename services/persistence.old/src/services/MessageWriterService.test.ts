import { FileService, LoggerService, MqttService } from "@powerpi/common";
import { MockLoggerService } from "@powerpi/common-test";
import MqttModel from "../models/mqtt.model.js";
import ConfigService from "./ConfigService.js";
import MessageWriterService from "./MessageWriterService.js";

vi.mock("../../src/models/mqtt.model");

describe("MessageWriterService", () => {
    let subject: MessageWriterService;

    beforeEach(() => {
        const fs = new FileService();
        const config = new ConfigService(fs);
        const logger = new MockLoggerService() as unknown as LoggerService;

        subject = new MessageWriterService(new MqttService(config, logger), logger);

        vi.resetAllMocks();
    });

    describe("message", () => {
        const mockRecord = vi.fn().mockReturnValue(Promise.resolve());
        const mockBuild = vi.fn().mockReturnValue(mockRecord);

        MqttModel.build = mockBuild;

        test("no timestamp", async () => {
            await subject.message("device", "LightBulb", "status", {});

            expect(mockBuild).toHaveBeenCalledTimes(1);

            expect(mockBuild).toHaveBeenCalledWith({
                type: "device",
                entity: "LightBulb",
                action: "status",
                timestamp: undefined,
                message: {},
            });
        });

        test("with timestamp", async () => {
            const date = new Date();
            const message = {
                timestamp: date.getTime(),
                value: 10,
                something: "else",
            };

            await subject.message("device", "LightBulb", "status", message);

            expect(mockBuild).toHaveBeenCalledTimes(1);

            expect(mockBuild).toHaveBeenCalledWith({
                type: "device",
                entity: "LightBulb",
                action: "status",
                timestamp: date,
                message: { value: 10, something: "else" },
            });
        });
    });
});
