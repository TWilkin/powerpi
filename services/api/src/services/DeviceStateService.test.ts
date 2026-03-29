import { Message, MqttConsumer, MqttService } from "@powerpi/common";
import { ChangeMessage, DeviceState } from "@powerpi/common-api";
import { anything, capture, instance, mock, resetCalls, verify, when } from "ts-mockito";
import ApiSocketService from "./ApiSocketService.js";
import ConfigService from "./ConfigService.js";
import DeviceStateService from "./DeviceStateService.js";
import { BatteryMessage } from "./listeners/BatteryStateListener.js";
import { CapabilityMessage } from "./listeners/CapabilityStateListener.js";
import { StateMessage } from "./listeners/DeviceStateListener.js";

const mockedConfigService = mock<ConfigService>();
const mockedMqttService = mock<MqttService>();
const mockedApiSocketService = mock<ApiSocketService>();

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

describe("DeviceStateService", () => {
    let subject: DeviceStateService | undefined;

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
        resetCalls(mockedApiSocketService);

        subject = new DeviceStateService(
            instance(mockedConfigService),
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

    describe("onDeviceStateMessage", () => {
        const timestampCases: (undefined | number)[] = [undefined, 1234];

        test.each(timestampCases)("timestamp: %p", (timestamp) => {
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
        });
    });

    test("onDeviceChangeMessage", () => {
        const device = subject!.devices[0];
        expect(device.state).toBe("unknown");
        expect(device.since).toBe(-1);
        expect(device.additionalState).toBeUndefined();

        const consumer = getConsumer<ChangeMessage & Message>("change");

        consumer?.message("device", "HallwayLight", "change", {
            state: DeviceState.On,
            brightness: 50,
            temperature: 2000,
        });

        expect(device.state).toBe("unknown");
        expect(device.since).toBe(-1);
        expect(device.additionalState).toBeUndefined();

        verify(
            mockedApiSocketService.onDeviceChangeMessage(
                "HallwayLight",
                DeviceState.On,
                anything(),
                anything(),
            ),
        ).once();

        const payload = capture(mockedApiSocketService.onDeviceChangeMessage);

        expect(payload.first()[2]).toStrictEqual({
            brightness: 50,
            temperature: 2000,
        });
    });

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
});
