import { ConfigFileType, LoggerService, MqttService } from "@powerpi/common";
import { anything, capture, instance, mock, resetCalls, verify } from "ts-mockito";
import ConfigPublishService from "./ConfigPublishService.js";

const mockedMqttService = mock<MqttService>();
const mockedLoggerService = mock<LoggerService>();

describe("ConfigPublishService", () => {
    let subject: ConfigPublishService | undefined;

    beforeEach(() => {
        resetCalls(mockedMqttService);

        subject = new ConfigPublishService(
            instance(mockedMqttService),
            instance(mockedLoggerService),
        );
    });

    test("publishConfigChange", async () => {
        const payload = { devices: [], sensors: [] };
        const checksum = "checksum123";

        await subject?.publishConfigChange(ConfigFileType.Devices, payload, checksum);

        verify(mockedMqttService.publish("config", "devices", "change", anything())).once();

        const message = {
            payload,
            checksum,
        };

        expect(capture(mockedMqttService.publish).first()[3]).toStrictEqual(message);
    });

    test("publishConfigError", async () => {
        const text = "Uh-oh";
        const errors = "I am error";

        await subject?.publishConfigError(ConfigFileType.Devices, text, errors);

        verify(mockedMqttService.publish("config", "devices", "error", anything())).once();

        const message = {
            message: text,
            errors,
        };

        expect(capture(mockedMqttService.publish).first()[3]).toStrictEqual(message);
    });
});
