import {
    ConfigFileType,
    ConfigRetrieverService,
    Message,
    MqttConsumer,
    MqttService,
} from "@powerpi/common";
import { capture, instance, mock, resetCalls, when } from "ts-mockito";
import ConfigService from "./ConfigService";
import SensorStateService from "./SensorStateService";
import { BatteryMessage } from "./listeners/BatteryStateListener";
import { EventMessage } from "./listeners/SensorStateListener";

const mockedConfigService = mock<ConfigService>();
const mockedConfigRetrieverService = mock<ConfigRetrieverService>();
const mockedMqttService = mock<MqttService>();

describe("SensorStateService", () => {
    let subject: SensorStateService | undefined;

    function getConsumer<TConsumer extends Message>(action: string) {
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

    function* getConfigListeners() {
        const listeners = capture(mockedConfigRetrieverService.addListener);

        for (let i = 0; i < 3; i++) {
            const listener = listeners.byCallIndex(i);
            yield listener[1];
        }
    }

    beforeEach(async () => {
        when(mockedConfigService.sensors).thenReturn([
            {
                name: "HallwayMotionSensor",
                type: "motion",
                location: "Hallway",
            },
            {
                name: "BedroomTempSensor",
                type: "temperature",
                location: "Bedroom",
            },
            {
                name: "Other",
                display_name: "Other Sensor",
                type: "other",
                location: "Atlantis",
                entity: "something",
                action: "else",
                visible: false,
            },
        ]);

        resetCalls(mockedMqttService);
        resetCalls(mockedConfigRetrieverService);

        subject = new SensorStateService(
            instance(mockedConfigService),
            instance(mockedConfigRetrieverService),
            instance(mockedMqttService),
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
        );

        await subject.$onInit();

        const sensors = subject?.sensors;
        expect(sensors).toHaveLength(0);
    });

    describe("onSensorStateMessage", () => {
        [undefined, 1234].forEach((timestamp) =>
            test(`timestamp: ${timestamp}`, () => {
                const consumer = getConsumer<EventMessage>("motion");

                const sensor = subject?.sensors.find(
                    (sensor) => sensor.name == "HallwayMotionSensor",
                );
                expect(sensor?.state).toBeUndefined();
                expect(sensor?.since).toBe(-1);

                consumer?.message("event", "HallwayMotionSensor", "motion", {
                    state: "detected",
                    timestamp,
                });

                expect(sensor?.state).toBe("detected");

                if (timestamp) {
                    expect(sensor?.since).toBe(timestamp);
                } else {
                    expect(sensor?.since).toBe(-1);
                }
            }),
        );
    });

    describe("onSensorDataMessage", () => {
        [undefined, 1234].forEach((timestamp) =>
            test(`timestamp: ${timestamp}`, () => {
                const consumer = getConsumer<EventMessage>("temperature");

                const sensor = subject?.sensors.find(
                    (sensor) => sensor.name == "BedroomTempSensor",
                );
                expect(sensor?.value).toBeUndefined();
                expect(sensor?.unit).toBeUndefined();
                expect(sensor?.since).toBe(-1);

                consumer?.message("event", "BedroomTempSensor", "temperature", {
                    value: 100,
                    unit: "F",
                    timestamp,
                });

                expect(sensor?.value).toBe(100);
                expect(sensor?.unit).toBe("F");

                if (timestamp) {
                    expect(sensor?.since).toBe(timestamp);
                } else {
                    expect(sensor?.since).toBe(-1);
                }
            }),
        );
    });

    test("onBatteryMessage", () => {
        const consumer = getConsumer<BatteryMessage>("battery");

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
    });

    test("onConfigMessage", () => {
        const listeners = [...getConfigListeners()];

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
                display_name: "Office Motion Sensor",
                type: "motion",
                location: "Office",
                visible: false,
            },
        ]);

        listeners.forEach((listener) => listener.onConfigChange(ConfigFileType.Devices));

        // we should have 1 updated and 2 removed
        expect(subject?.sensors).toHaveLength(1);

        // check the updated config
        sensor = subject!.sensors[0];
        expect(sensor.name).toBe("HallwayMotionSensor");
        expect(sensor.display_name).toBe("Office Motion Sensor");
        expect(sensor.type).toBe("motion");
        expect(sensor.location).toBe("Office");
        expect(sensor.entity).toBe("HallwayMotionSensor");
        expect(sensor.action).toBe("motion");
        expect(sensor.visible).toBeFalsy();
    });
});
