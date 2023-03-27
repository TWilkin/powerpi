import { FileService, LoggerService, MqttService } from "@powerpi/common";
import { MockLoggerService } from "@powerpi/common-test";
import MqttModel from "../../src/models/mqtt.model";
import ConfigService from "../../src/services/ConfigService";
import MessageWriterService from "../../src/services/MessageWriterService";

jest.mock("../../src/models/mqtt.model");

describe("MessageWriterService", () => {
    let subject: MessageWriterService;

    beforeEach(() => {
        const fs = new FileService();
        const config = new ConfigService(fs);
        const logger = new MockLoggerService() as unknown as LoggerService;

        subject = new MessageWriterService(new MqttService(config, logger), logger);

        jest.resetAllMocks();
    });

    describe("message", () => {
        const mockRecord = jest.fn().mockReturnValue(Promise.resolve());
        const mockBuild = jest.fn().mockReturnValue(mockRecord);

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
