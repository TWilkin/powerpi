import { MqttService } from "@powerpi/common";
import { DeviceState } from "@powerpi/common-api";
import { Namespace } from "socket.io";
import { anything, capture, instance, mock, resetCalls, verify, when } from "ts-mockito";
import ApiSocketService from "./ApiSocketService";
import ConfigService from "./ConfigService";

const mockedConfigService = mock<ConfigService>();
const mockedMqttService = mock<MqttService>();
const mockedNamespace = mock<Namespace>();

describe("ApiSocketService", () => {
    let subject: ApiSocketService | undefined;

    beforeEach(() => {
        when(mockedConfigService.sensors).thenReturn([
            { name: "MySensor", type: "sensor", location: "Atlantis" },
        ]);

        resetCalls(mockedNamespace);

        subject = new ApiSocketService(instance(mockedConfigService), instance(mockedMqttService));

        subject.$onNamespaceInit(instance(mockedNamespace));
    });

    test("onDeviceStateMessage", () => {
        subject?.onDeviceStateMessage("HallwayLight", DeviceState.On, 1234, { brightness: 50 });

        verify(mockedNamespace.emit("device", anything())).once();

        const payload = capture(mockedNamespace.emit<"device">);

        expect(payload.first()[1]).toStrictEqual({
            device: "HallwayLight",
            state: "on",
            timestamp: 1234,
            additionalState: { brightness: 50 },
        });
    });

    describe("onEventMessage", () => {
        test("motion", () => {
            subject?.onEventMessage("HallwayMotionSensor", "detected", undefined, undefined, 1234);

            verify(mockedNamespace.emit("sensor", anything())).once();

            const payload = capture(mockedNamespace.emit<"sensor">);

            expect(payload.first()[1]).toStrictEqual({
                sensor: "HallwayMotionSensor",
                state: "detected",
                value: undefined,
                unit: undefined,
                timestamp: 1234,
            });
        });

        test("data", () => {
            subject?.onEventMessage("HallwayTempSensor", undefined, 100, "F", 1234);

            verify(mockedNamespace.emit("sensor", anything())).once();

            const payload = capture(mockedNamespace.emit<"sensor">);

            expect(payload.first()[1]).toStrictEqual({
                sensor: "HallwayTempSensor",
                state: undefined,
                value: 100,
                unit: "F",
                timestamp: 1234,
            });
        });
    });

    describe("onBatterMessage", () => {
        test("device", () => {
            subject?.onBatteryMessage("device", "Light", 53, true, 1234);

            verify(mockedNamespace.emit("battery", anything())).once();

            const payload = capture(mockedNamespace.emit<"battery">);

            expect(payload.first()[1]).toStrictEqual({
                device: "Light",
                sensor: undefined,
                battery: 53,
                charging: true,
                timestamp: 1234,
            });
        });

        test("sensor", () => {
            subject?.onBatteryMessage("sensor", "Remote", 53, undefined, 1234);

            verify(mockedNamespace.emit("battery", anything())).once();

            const payload = capture(mockedNamespace.emit<"battery">);

            expect(payload.first()[1]).toStrictEqual({
                device: undefined,
                sensor: "Remote",
                battery: 53,
                charging: undefined,
                timestamp: 1234,
            });
        });
    });

    test("onCapabilityMessage", () => {
        subject?.onCapabilityMessage(
            "Light",
            { brightness: true, colour: { temperature: true } },
            1234,
        );

        verify(mockedNamespace.emit("capability", anything())).once();

        const payload = capture(mockedNamespace.emit<"capability">);

        expect(payload.first()[1]).toStrictEqual({
            device: "Light",
            capability: { brightness: true, colour: { temperature: true } },
            timestamp: 1234,
        });
    });
});
