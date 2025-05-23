import { ConfigFileType, ConfigRetrieverService } from "@powerpi/common";
import { DeviceState } from "@powerpi/common-api";
import { Namespace } from "socket.io";
import { anyString, anything, capture, instance, mock, resetCalls, verify } from "ts-mockito";
import ApiSocketService from "./ApiSocketService.js";

const mockedNamespace = mock<Namespace>();

describe("ApiSocketService", () => {
    let subject: ApiSocketService | undefined;

    beforeEach(() => {
        resetCalls(mockedNamespace);

        const mockedConfigRetrieverService = mock<ConfigRetrieverService>();

        subject = new ApiSocketService(instance(mockedConfigRetrieverService));
    });

    test("$onConnection", () => subject?.$onConnection());
    test("$onDisconnect", () => subject?.$onDisconnect());

    describe("onDeviceStateMessage", () => {
        test("success", () => {
            subject?.$onNamespaceInit(instance(mockedNamespace));

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

        test("no namespace", () => {
            subject?.onDeviceStateMessage("HallwayLight", DeviceState.On, 1234);

            verify(mockedNamespace.emit(anyString(), anything())).never();
        });
    });

    describe("onDeviceChangeMessage", () => {
        test("success", () => {
            subject?.$onNamespaceInit(instance(mockedNamespace));

            subject?.onDeviceChangeMessage(
                "HallwayLight",
                DeviceState.On,
                { brightness: 50 },
                1234,
            );

            verify(mockedNamespace.emit("change", anything())).once();

            const payload = capture(mockedNamespace.emit<"change">);

            expect(payload.first()[1]).toStrictEqual({
                device: "HallwayLight",
                state: "on",
                additionalState: { brightness: 50 },
                timestamp: 1234,
            });
        });

        test("no namespace", () => {
            subject?.onDeviceChangeMessage("HallwayLight", DeviceState.On, {}, 1234);

            verify(mockedNamespace.emit(anyString(), anything())).never();
        });
    });

    describe("onEventMessage", () => {
        test("motion", () => {
            subject?.$onNamespaceInit(instance(mockedNamespace));

            subject?.onEventMessage(
                "HallwayMotionSensor",
                "motion",
                "detected",
                undefined,
                undefined,
                1234,
            );

            verify(mockedNamespace.emit("sensor", anything())).once();

            const payload = capture(mockedNamespace.emit<"sensor">);

            expect(payload.first()[1]).toStrictEqual({
                sensor: "HallwayMotionSensor",
                action: "motion",
                state: "detected",
                value: undefined,
                unit: undefined,
                timestamp: 1234,
            });
        });

        test("data", () => {
            subject?.$onNamespaceInit(instance(mockedNamespace));

            subject?.onEventMessage("HallwayTempSensor", "temperature", undefined, 100, "F", 1234);

            verify(mockedNamespace.emit("sensor", anything())).once();

            const payload = capture(mockedNamespace.emit<"sensor">);

            expect(payload.first()[1]).toStrictEqual({
                sensor: "HallwayTempSensor",
                action: "temperature",
                state: undefined,
                value: 100,
                unit: "F",
                timestamp: 1234,
            });
        });

        test("no namespace", () => {
            subject?.onEventMessage("HallwayTempSensor", "temperature", undefined, 100, "F", 1234);

            verify(mockedNamespace.emit(anyString(), anything())).never();
        });
    });

    describe("onBatteryMessage", () => {
        test("device", () => {
            subject?.$onNamespaceInit(instance(mockedNamespace));

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
            subject?.$onNamespaceInit(instance(mockedNamespace));

            subject?.onBatteryMessage("sensor", "HallwayTempSensor", 53, false, 1234);

            verify(mockedNamespace.emit("battery", anything())).once();

            const payload = capture(mockedNamespace.emit<"battery">);

            expect(payload.first()[1]).toStrictEqual({
                device: undefined,
                sensor: "HallwayTempSensor",
                battery: 53,
                charging: false,
                timestamp: 1234,
            });
        });

        test("no namespace", () => {
            subject?.onBatteryMessage("sensor", "HallwayTempSensor", 53, false, 1234);

            verify(mockedNamespace.emit(anyString(), anything())).never();
        });
    });

    describe("onCapabilityMessage", () => {
        test("success", () => {
            subject?.$onNamespaceInit(instance(mockedNamespace));

            subject?.onCapabilityMessage(
                "Light",
                {
                    brightness: true,
                    colour: { temperature: true },
                },
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

        test("no namespace", () => {
            subject?.onCapabilityMessage("Light", { brightness: true }, 1234);

            verify(mockedNamespace.emit(anyString(), anything())).never();
        });
    });

    describe("onConfigChange", () => {
        test("success", () => {
            subject?.$onNamespaceInit(instance(mockedNamespace));

            subject?.onConfigChange(ConfigFileType.Devices);

            verify(mockedNamespace.emit("config", anything())).once();

            const payload = capture(mockedNamespace.emit<"config">);

            expect(payload.first()[1]).toStrictEqual({
                type: ConfigFileType.Devices,
            });
        });

        test("no namespace", () => {
            subject?.onConfigChange(ConfigFileType.Devices);

            verify(mockedNamespace.emit(anyString(), anything())).never();
        });
    });
});
