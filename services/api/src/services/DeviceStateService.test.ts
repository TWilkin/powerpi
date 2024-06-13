import {
    ConfigFileType,
    ConfigRetrieverService,
    Message,
    MqttConsumer,
    MqttService,
} from "@powerpi/common";
import { DeviceState } from "@powerpi/common-api";
import { anything, capture, instance, mock, resetCalls, verify, when } from "ts-mockito";
import ApiSocketService from "./ApiSocketService";
import ConfigService from "./ConfigService";
import DeviceStateService from "./DeviceStateService";
import { BatteryMessage } from "./listeners/BatteryStateListener";
import { CapabilityMessage } from "./listeners/CapabilityStateListener";
import { StateMessage } from "./listeners/DeviceStateListener";

const mockedConfigService = mock<ConfigService>();
const mockedConfigRetrieverService = mock<ConfigRetrieverService>();
const mockedMqttService = mock<MqttService>();
const mockedApiSocketService = mock<ApiSocketService>();

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

    function getConfigListener() {
        const listeners = capture(mockedConfigRetrieverService.addListener);

        const listener = listeners.byCallIndex(0);
        return listener[1];
    }

    beforeEach(() => {
        when(mockedConfigService.devices).thenReturn([
            {
                name: "HallwayLight",
                displayName: "Hallway Light",
                type: "Light",
                location: "Hallway",
                categories: ["Light", "Something"],
                visible: false,
            },
        ]);

        resetCalls(mockedMqttService);
        resetCalls(mockedConfigRetrieverService);
        resetCalls(mockedApiSocketService);

        subject = new DeviceStateService(
            instance(mockedConfigService),
            instance(mockedConfigRetrieverService),
            instance(mockedMqttService),
            instance(mockedApiSocketService),
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
                instance(mockedApiSocketService),
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
                instance(mockedApiSocketService),
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
        expect(device.visible).toBeFalsy();
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

                verify(
                    mockedApiSocketService.onDeviceStateMessage(
                        "HallwayLight",
                        DeviceState.On,
                        timestamp,
                        anything(),
                    ),
                ).once();

                const payload = capture(mockedApiSocketService.onDeviceStateMessage);

                expect(payload.first()[3]).toStrictEqual({
                    brightness: 50,
                    temperature: 2000,
                });
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

                verify(
                    mockedApiSocketService.onBatteryMessage(
                        "device",
                        "HallwayLight",
                        53,
                        charging ?? false,
                        1234,
                    ),
                ).once();
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
            timestamp: 1234,
        });

        expect(device.capability).toStrictEqual({
            brightness: true,
            colour: { temperature: true },
        });

        verify(mockedApiSocketService.onCapabilityMessage("HallwayLight", anything(), 1234)).once();

        const payload = capture(mockedApiSocketService.onCapabilityMessage);

        expect(payload.first()[1]).toStrictEqual({
            brightness: true,
            colour: { temperature: true },
        });
    });

    describe("onConfigChange", () => {
        test("updated device", () => {
            const listener = getConfigListener();

            let device = subject!.devices[0];

            // check the initial config
            expect(device.display_name).toBe("Hallway Light");
            expect(device.location).toBe("Hallway");
            expect(device.categories).toStrictEqual(["Light", "Something"]);
            expect(device.visible).toBeFalsy();

            // check the initial state
            expect(device.state).toBe(DeviceState.Unknown);
            expect(device.since).toBe(-1);

            // change what it'll return
            when(mockedConfigService.devices).thenReturn([
                {
                    name: "HallwayLight",
                    displayName: "Office Socket",
                    type: "Socket",
                    location: "Office",
                    categories: ["Socket", "Something Else"],
                },
            ]);

            listener.onConfigChange(ConfigFileType.Devices);

            expect(subject!.devices).toHaveLength(1);
            device = subject!.devices[0];

            // check the new config
            expect(device.display_name).toBe("Office Socket");
            expect(device.location).toBe("Office");
            expect(device.categories).toStrictEqual(["Socket", "Something Else"]);
            expect(device.visible).toBeTruthy();

            // check the state is unchanged
            expect(device.state).toBe(DeviceState.Unknown);
            expect(device.since).toBe(-1);
        });

        test("deleted/added device", () => {
            const listener = getConfigListener();

            let device = subject!.devices[0];

            // check the initial config
            expect(device.display_name).toBe("Hallway Light");

            when(mockedConfigService.devices).thenReturn([
                {
                    name: "Something Else",
                    displayName: "Office Socket",
                    type: "Socket",
                },
            ]);

            listener.onConfigChange(ConfigFileType.Devices);

            expect(subject!.devices).toHaveLength(1);
            device = subject!.devices[0];

            // check the device is new
            expect(device.name).toBe("Something Else");
            expect(device.display_name).toBe("Office Socket");
            expect(device.visible).toBeTruthy();

            // check the state is initialised
            expect(device.state).toBe(DeviceState.Unknown);
            expect(device.since).toBe(-1);
        });
    });
});
