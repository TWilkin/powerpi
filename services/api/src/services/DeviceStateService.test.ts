import { ConfigRetrieverService, Message, MqttConsumer, MqttService } from "@powerpi/common";
import { DeviceState } from "@powerpi/common-api";
import { capture, instance, mock, resetCalls, when } from "ts-mockito";
import ConfigService from "./ConfigService";
import DeviceStateService from "./DeviceStateService";
import { BatteryMessage } from "./listeners/BatteryStateListener";
import { CapabilityMessage } from "./listeners/CapabilityStateListener";
import { StateMessage } from "./listeners/DeviceStateListener";

const mockedConfigService = mock<ConfigService>();
const mockedConfigRetrieverService = mock<ConfigRetrieverService>();
const mockedMqttService = mock<MqttService>();

describe("DeviceStateService", () => {
    let subject: DeviceStateService | undefined;

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

    beforeEach(() => {
        when(mockedConfigService.devices).thenReturn([
            {
                name: "HallwayLight",
                displayName: "Hallway Light",
                type: "Light",
                location: "Hallway",
                categories: ["Light", "Something"],
            },
        ]);

        resetCalls(mockedMqttService);

        subject = new DeviceStateService(
            instance(mockedConfigService),
            instance(mockedConfigRetrieverService),
            instance(mockedMqttService),
        );

        subject?.$onInit();
    });

    describe("devices", () => {
        test("some", () => {
            when(mockedConfigService.devices).thenReturn([
                {
                    name: "HallwayLight",
                    displayName: "Hallway Light",
                    type: "Light",
                },
                {
                    name: "BedroomLight",
                    displayName: "Bedroom Light",
                    type: "Light",
                    visible: false,
                },
            ]);

            subject = new DeviceStateService(
                instance(mockedConfigService),
                instance(mockedConfigRetrieverService),
                instance(mockedMqttService),
            );

            subject?.$onInit();

            const devices = subject?.devices;
            expect(devices).toHaveLength(2);

            let device = devices.find((device) => device.name === "HallwayLight");
            expect(device?.visible).toBeTruthy();

            device = devices.find((device) => device.name === "BedroomLight");
            expect(device?.visible).toBeFalsy();
        });

        test("none", () => {
            subject = new DeviceStateService(
                instance(mockedConfigService),
                instance(mockedConfigRetrieverService),
                instance(mockedMqttService),
            );

            const devices = subject?.devices;
            expect(devices).toHaveLength(0);
        });
    });

    test("initialise", () => {
        const devices = subject?.devices;
        expect(devices).toHaveLength(1);

        const device = devices![0];
        expect(device.name).toBe("HallwayLight");
        expect(device.display_name).toBe("Hallway Light");
        expect(device.type).toBe("Light");
        expect(device.visible).toBeTruthy();
        expect(device.location).toBe("Hallway");
        expect(device.categories).toStrictEqual(["Light", "Something"]);
    });

    describe("onDeviceStateMessage", () =>
        [undefined, 1234].forEach((timestamp) =>
            test(`timestamp: ${timestamp}`, () => {
                const device = subject!.devices[0];
                expect(device.state).toBe("unknown");
                expect(device.since).toBe(-1);
                expect(device.additionalState).toBeUndefined();

                const consumer = getConsumer<StateMessage>("status");

                consumer?.message("device", "HallwayLight", "status", {
                    state: DeviceState.On,
                    timestamp: timestamp,
                    brightness: 50,
                    temperature: 2000,
                });

                expect(device.state).toBe("on");
                expect(device.additionalState).toBeDefined();
                expect(device.additionalState?.brightness).toBe(50);
                expect(device.additionalState?.temperature).toBe(2000);

                if (timestamp) {
                    expect(device.since).toBe(1234);
                } else {
                    expect(device.since).toBe(-1);
                }
            }),
        ));

    describe("onBatteryMessage", () => {
        [true, false, undefined].forEach((charging) =>
            test(`charging: ${charging}`, () => {
                const device = subject!.devices[0];
                expect(device.battery).toBeUndefined();
                expect(device.batterySince).toBeUndefined();
                expect(device.charging).toBeFalsy();

                const consumer = getConsumer<BatteryMessage>("battery");

                consumer?.message("device", "HallwayLight", "battery", {
                    value: 53,
                    unit: "%",
                    charging,
                    timestamp: 1234,
                });

                expect(device.battery).toBe(53);
                expect(device.batterySince).toBe(1234);

                if (charging) {
                    expect(device.charging).toBeTruthy();
                } else {
                    expect(device.charging).toBeFalsy();
                }
            }),
        );
    });

    test("onCapabilityMessage", () => {
        const device = subject!.devices[0];
        expect(device.capability).toBeUndefined();

        const consumer = getConsumer<CapabilityMessage>("capability");

        consumer?.message("device", "HallwayLight", "capability", {
            brightness: true,
            colour: {
                temperature: true,
            },
        });

        expect(device.capability).toStrictEqual({
            brightness: true,
            colour: { temperature: true },
        });
    });
});
