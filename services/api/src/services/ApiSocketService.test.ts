import { ConfigRetrieverService, Message, MqttConsumer, MqttService } from "@powerpi/common";
import { DeviceState } from "@powerpi/common-api";
import { Namespace } from "socket.io";
import { anyString, anything, capture, instance, mock, resetCalls, verify, when } from "ts-mockito";
import ApiSocketService from "./ApiSocketService";
import ConfigService from "./ConfigService";
import { BatteryMessage } from "./listeners/BatteryStateListener";
import { CapabilityMessage } from "./listeners/CapabilityStateListener";
import { StateMessage } from "./listeners/DeviceStateListener";
import { EventMessage } from "./listeners/SensorStateListener";

const mockedConfigService = mock<ConfigService>();
const mockedConfigRetrieverService = mock<ConfigRetrieverService>();
const mockedMqttService = mock<MqttService>();
const mockedNamespace = mock<Namespace>();

describe("ApiSocketService", () => {
    let subject: ApiSocketService | undefined;

    function getConsumer<TConsumer extends Message>(action: string, entity?: string) {
        const subscriptions = capture(mockedMqttService.subscribe);

        for (let i = 0; ; i++) {
            const subscription = subscriptions.byCallIndex(i);
            if (!subscription) {
                break;
            }

            if (subscription[2] === action) {
                if (entity === undefined || subscription[1] === entity) {
                    return subscription[3] as MqttConsumer<TConsumer>;
                }
            }
        }

        return undefined;
    }

    beforeEach(async () => {
        when(mockedConfigService.sensors).thenReturn([
            { name: "MySensor", type: "sensor", location: "Atlantis" },
            { name: "HallwayMotionSensor", type: "motion", location: "Hallway" },
            { name: "HallwayTempSensor", type: "temperature", location: "Hallway" },
        ]);

        resetCalls(mockedMqttService);
        resetCalls(mockedNamespace);

        subject = new ApiSocketService(
            instance(mockedConfigService),
            instance(mockedConfigRetrieverService),
            instance(mockedMqttService),
        );

        await subject.$onInit();
    });

    test("$onConnection", () => subject?.$onConnection());
    test("$onDisconnect", () => subject?.$onDisconnect());

    describe("onDeviceStateMessage", () => {
        test("success", () => {
            subject?.$onNamespaceInit(instance(mockedNamespace));

            const consumer = getConsumer<StateMessage>("status");

            consumer?.message("device", "HallwayLight", "status", {
                state: DeviceState.On,
                timestamp: 1234,
                brightness: 50,
            });

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

    describe("onEventMessage", () => {
        test("motion", () => {
            subject?.$onNamespaceInit(instance(mockedNamespace));

            const consumer = getConsumer<EventMessage>("motion");

            consumer?.message("event", "HallwayMotionSensor", "motion", {
                state: "detected",
                timestamp: 1234,
            });

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
            subject?.$onNamespaceInit(instance(mockedNamespace));

            const consumer = getConsumer<EventMessage>("temperature");

            consumer?.message("event", "HallwayTempSensor", "temperature", {
                value: 100,
                unit: "F",
                timestamp: 1234,
            });

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

        test("no namespace", () => {
            subject?.onEventMessage("HallwayTempSensor", undefined, 100, "F", 1234);

            verify(mockedNamespace.emit(anyString(), anything())).never();
        });
    });

    describe("onBatterMessage", () => {
        test("device", () => {
            subject?.$onNamespaceInit(instance(mockedNamespace));

            const consumer = getConsumer<BatteryMessage>("battery");

            consumer?.message("device", "Light", "battery", {
                value: 53,
                charging: true,
                timestamp: 1234,
            });

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

            const consumer = getConsumer<BatteryMessage>("battery", "HallwayTempSensor");

            consumer?.message("event", "HallwayTempSensor", "battery", {
                value: 53,
                timestamp: 1234,
            });

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

            const consumer = getConsumer<CapabilityMessage>("capability");

            consumer?.message("device", "Light", "capability", {
                brightness: true,
                colour: { temperature: true },
                timestamp: 1234,
            });

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
});
