import {
    ConfigFileType,
    ConfigRetrieverService,
    Message,
    MqttConsumer,
    MqttService,
} from "@powerpi/common";
import { capture, instance, mock, resetCalls, verify, when } from "ts-mockito";
import ApiSocketService from "./ApiSocketService.js";
import ConfigService from "./ConfigService.js";
import SensorStateService from "./SensorStateService.js";
import { BatteryMessage } from "./listeners/BatteryStateListener.js";
import { EventMessage } from "./listeners/SensorStateListener.js";

const mockedConfigService = mock<ConfigService>();
const mockedConfigRetrieverService = mock<ConfigRetrieverService>();
const mockedMqttService = mock<MqttService>();
const mockedApiSocketService = mock<ApiSocketService>();

describe("SensorStateService", () => {
    let subject: SensorStateService | undefined;

    function getConsumer<TConsumer extends Message>(action: string = "+") {
        const subscriptions = capture(mockedMqttService.subscribe);

        for (let i = 0; ; i++) {
            const subscription = subscriptions.byCallIndex(i);
            if (!subscription) {
                break;
            }

            if (subscription[2] === action) {
                return subscription[3] as MqttConsumer<TConsumer>;
            }
        }

        return undefined;
    }

    function getConfigListener() {
        const listeners = capture(mockedConfigRetrieverService.addListener);

        const listener = listeners.byCallIndex(0);
        return listener[1];
    }

    beforeEach(async () => {
        when(mockedConfigService.sensors).thenReturn([
            {
                name: "HallwayMotionSensor",
                displayName: "HallwayMotionSensor",
                type: "motion",
                location: "Hallway",
            },
            {
                name: "BedroomTempSensor",
                displayName: "BedroomTempSensor",
                type: "temperature",
                location: "Bedroom",
            },
            {
                name: "Other",
                displayName: "Other Sensor",
                type: "other",
                location: "Atlantis",
                entity: "something",
                action: "else",
                visible: false,
            },
        ]);

        resetCalls(mockedMqttService);
        resetCalls(mockedConfigRetrieverService);
        resetCalls(mockedApiSocketService);

        subject = new SensorStateService(
            instance(mockedConfigService),
            instance(mockedConfigRetrieverService),
            instance(mockedMqttService),
            instance(mockedApiSocketService),
        );

        await subject.$onInit();
    });

    describe("sensors", () => {
        test("some", () => {
            const sensors = subject?.sensors;
            expect(sensors).toHaveLength(3);

            let sensor = sensors![0];
            expect(sensor.name).toBe("HallwayMotionSensor");
            expect(sensor.display_name).toBe("HallwayMotionSensor");
            expect(sensor.type).toBe("motion");
            expect(sensor.location).toBe("Hallway");
            expect(sensor.entity).toBe("HallwayMotionSensor");
            expect(sensor.action).toBe("motion");
            expect(sensor.visible).toBeTruthy();

            sensor = sensors![2];
            expect(sensor.name).toBe("Other");
            expect(sensor.display_name).toBe("Other Sensor");
            expect(sensor.type).toBe("other");
            expect(sensor.location).toBe("Atlantis");
            expect(sensor.entity).toBe("something");
            expect(sensor.action).toBe("else");
            expect(sensor.visible).toBeFalsy();
        });

        test("none", () => {
            subject = new SensorStateService(
                instance(mockedConfigService),
                instance(mockedConfigRetrieverService),
                instance(mockedMqttService),
                instance(mockedApiSocketService),
            );

            const sensors = subject?.sensors;
            expect(sensors).toHaveLength(0);
        });
    });

    test("$onInit", async () => {
        when(mockedConfigService.sensors).thenReturn([]);

        subject = new SensorStateService(
            instance(mockedConfigService),
            instance(mockedConfigRetrieverService),
            instance(mockedMqttService),
            instance(mockedApiSocketService),
        );

        await subject.$onInit();

        const sensors = subject?.sensors;
        expect(sensors).toHaveLength(0);
    });

    describe("onSensorStateMessage", () => {
        [undefined, 1234].forEach((timestamp) =>
            test(`timestamp: ${timestamp}`, () => {
                const consumer = getConsumer<EventMessage>();

                const sensor = subject?.sensors.find(
                    (sensor) => sensor.name == "HallwayMotionSensor",
                );
                expect(sensor?.data.motion).toBeUndefined();

                consumer?.message("event", "HallwayMotionSensor", "motion", {
                    state: "detected",
                    timestamp,
                });

                expect(sensor?.data.motion).toBeDefined();
                expect(sensor?.data.motion?.state).toBe("detected");

                if (timestamp) {
                    expect(sensor?.data.motion?.since).toBe(timestamp);
                } else {
                    expect(sensor?.data.motion?.since).toBe(-1);
                }

                verify(
                    mockedApiSocketService.onEventMessage(
                        "HallwayMotionSensor",
                        "motion",
                        "detected",
                        undefined,
                        undefined,
                        timestamp,
                    ),
                ).once();
            }),
        );
    });

    describe("onSensorDataMessage", () => {
        [undefined, 1234].forEach((timestamp) =>
            test(`timestamp: ${timestamp}`, () => {
                const consumer = getConsumer<EventMessage>();

                const sensor = subject?.sensors.find(
                    (sensor) => sensor.name == "BedroomTempSensor",
                );
                expect(sensor?.data.temperature).toBeUndefined();

                consumer?.message("event", "BedroomTempSensor", "temperature", {
                    value: 100,
                    unit: "F",
                    timestamp,
                });

                expect(sensor?.data.temperature).toBeDefined();
                expect(sensor?.data.temperature?.value).toBe(100);
                expect(sensor?.data.temperature?.unit).toBe("F");

                if (timestamp) {
                    expect(sensor?.data.temperature?.since).toBe(timestamp);
                } else {
                    expect(sensor?.data.temperature?.since).toBe(-1);
                }

                verify(
                    mockedApiSocketService.onEventMessage(
                        "BedroomTempSensor",
                        "temperature",
                        undefined,
                        100,
                        "F",
                        timestamp,
                    ),
                ).once();
            }),
        );
    });

    test("onBatteryMessage", () => {
        const consumer = getConsumer<BatteryMessage>();

        const sensor = subject?.sensors.find((sensor) => sensor.name == "HallwayMotionSensor");
        expect(sensor?.battery).toBeUndefined();
        expect(sensor?.batterySince).toBeUndefined();
        expect(sensor?.charging).toBeFalsy();

        consumer?.message("event", "HallwayMotionSensor", "battery", {
            value: 53,
            unit: "%",
            charging: true,
            timestamp: 1234,
        });

        expect(sensor?.battery).toBe(53);
        expect(sensor?.batterySince).toBe(1234);
        expect(sensor?.charging).toBeTruthy();

        verify(
            mockedApiSocketService.onBatteryMessage(
                "sensor",
                "HallwayMotionSensor",
                53,
                true,
                1234,
            ),
        ).once();
    });

    test("onConfigMessage", () => {
        const listener = getConfigListener();

        expect(subject?.sensors).toHaveLength(3);

        // check the initial config
        let sensor = subject!.sensors[0];
        expect(sensor.name).toBe("HallwayMotionSensor");
        expect(sensor.display_name).toBe("HallwayMotionSensor");
        expect(sensor.type).toBe("motion");
        expect(sensor.location).toBe("Hallway");
        expect(sensor.entity).toBe("HallwayMotionSensor");
        expect(sensor.action).toBe("motion");
        expect(sensor.visible).toBeTruthy();

        // change what it'll return
        when(mockedConfigService.sensors).thenReturn([
            {
                name: "HallwayMotionSensor",
                displayName: "Office Motion Sensor",
                type: "motion",
                location: "Office",
                visible: false,
            },
            {
                name: "NewSensor",
                displayName: "New Sensor",
                type: "temperature",
                location: "Hallway",
            },
        ]);

        listener.onConfigChange(ConfigFileType.Devices);

        // we should have 1 updated, 1 added and 2 removed
        expect(subject?.sensors).toHaveLength(2);

        // check the updated config
        sensor = subject!.sensors[0];
        expect(sensor.name).toBe("HallwayMotionSensor");
        expect(sensor.display_name).toBe("Office Motion Sensor");
        expect(sensor.type).toBe("motion");
        expect(sensor.location).toBe("Office");
        expect(sensor.entity).toBe("HallwayMotionSensor");
        expect(sensor.action).toBe("motion");
        expect(sensor.visible).toBeFalsy();

        // check the added config
        sensor = subject!.sensors[1];
        expect(sensor.name).toBe("NewSensor");
        expect(sensor.display_name).toBe("New Sensor");
        expect(sensor.type).toBe("temperature");
        expect(sensor.location).toBe("Hallway");
        expect(sensor.entity).toBe("NewSensor");
        expect(sensor.action).toBe("temperature");
        expect(sensor.visible).toBeTruthy();
    });
});
