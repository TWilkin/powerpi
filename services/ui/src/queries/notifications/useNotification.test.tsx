import {
    BatteryStatusMessage,
    CapabilityStatusMessage,
    ConfigFileType,
    ConfigStatusMessage,
    DeviceChangeMessage,
    DeviceState,
    DeviceStatusMessage,
    SensorStatusMessage,
} from "@powerpi/common-api";
import { act, renderHook } from "@testing-library/react";
import { vi } from "vitest";
import useNotification from "./useNotification";

const mocks = vi.hoisted(() => ({
    api: {
        addConfigChangeListener: vi.fn(),
        addDeviceListener: vi.fn(),
        addDeviceChangeListener: vi.fn(),
        addSensorListener: vi.fn(),
        addBatteryListener: vi.fn(),
        addCapabilityListener: vi.fn(),
        removeConfigChangeListener: vi.fn(),
        removeDeviceListener: vi.fn(),
        removeDeviceChangeListener: vi.fn(),
        removeSensorListener: vi.fn(),
        removeBatteryListener: vi.fn(),
        removeCapabilityListener: vi.fn(),
    },
    patchDevice: vi.fn(),
    setChangingState: vi.fn(),
    patchSensor: vi.fn(),
    queryClient: {
        invalidateQueries: vi.fn(),
    },
    useUser: vi.fn(),
}));

vi.mock("../../hooks/useUser", () => ({ default: mocks.useUser }));
vi.mock("../useAPI", () => ({ default: () => mocks.api }));
vi.mock("../useDevicePatcher", () => ({ default: () => mocks.patchDevice }));
vi.mock("../useSensorPatcher", () => ({ default: () => mocks.patchSensor }));
vi.mock("./useDeviceChangingState", () => ({
    default: () => ({ setChangingState: mocks.setChangingState }),
}));

vi.mock("@tanstack/react-query", async () => {
    const actual = await vi.importActual("@tanstack/react-query");
    return {
        ...actual,
        useQueryClient: () => mocks.queryClient,
    };
});

describe("useNotification", () => {
    beforeEach(() => {
        vi.resetAllMocks();

        mocks.useUser.mockReturnValue("someone@example.com");
    });

    test("doesn't mount or unmounts without user", () => {
        mocks.useUser.mockReturnValue(undefined);

        const { unmount } = renderHook(useNotification);

        expect(mocks.api.addConfigChangeListener).not.toHaveBeenCalledTimes(1);
        expect(mocks.api.addDeviceListener).not.toHaveBeenCalledTimes(1);
        expect(mocks.api.addDeviceChangeListener).not.toHaveBeenCalledTimes(1);
        expect(mocks.api.addSensorListener).not.toHaveBeenCalledTimes(1);
        expect(mocks.api.addBatteryListener).not.toHaveBeenCalledTimes(1);
        expect(mocks.api.addCapabilityListener).not.toHaveBeenCalledTimes(1);

        expect(mocks.api.removeConfigChangeListener).not.toHaveBeenCalled();
        expect(mocks.api.removeDeviceListener).not.toHaveBeenCalled();
        expect(mocks.api.removeDeviceChangeListener).not.toHaveBeenCalled();
        expect(mocks.api.removeSensorListener).not.toHaveBeenCalled();
        expect(mocks.api.removeBatteryListener).not.toHaveBeenCalled();
        expect(mocks.api.removeCapabilityListener).not.toHaveBeenCalled();

        act(unmount);

        expect(mocks.api.removeConfigChangeListener).not.toHaveBeenCalled();
        expect(mocks.api.removeDeviceListener).not.toHaveBeenCalled();
        expect(mocks.api.removeDeviceChangeListener).not.toHaveBeenCalled();
        expect(mocks.api.removeSensorListener).not.toHaveBeenCalled();
        expect(mocks.api.removeBatteryListener).not.toHaveBeenCalled();
        expect(mocks.api.removeCapabilityListener).not.toHaveBeenCalled();
    });

    test("mounts and unmounts", () => {
        mocks.useUser.mockReturnValue("someone@example.com");

        const { unmount } = renderHook(useNotification);

        expect(mocks.api.addConfigChangeListener).toHaveBeenCalledTimes(1);
        expect(mocks.api.addDeviceListener).toHaveBeenCalledTimes(1);
        expect(mocks.api.addDeviceChangeListener).toHaveBeenCalledTimes(1);
        expect(mocks.api.addSensorListener).toHaveBeenCalledTimes(1);
        expect(mocks.api.addBatteryListener).toHaveBeenCalledTimes(1);
        expect(mocks.api.addCapabilityListener).toHaveBeenCalledTimes(1);

        expect(mocks.api.removeConfigChangeListener).not.toHaveBeenCalled();
        expect(mocks.api.removeDeviceListener).not.toHaveBeenCalled();
        expect(mocks.api.removeDeviceChangeListener).not.toHaveBeenCalled();
        expect(mocks.api.removeSensorListener).not.toHaveBeenCalled();
        expect(mocks.api.removeBatteryListener).not.toHaveBeenCalled();
        expect(mocks.api.removeCapabilityListener).not.toHaveBeenCalled();

        act(unmount);

        expect(mocks.api.removeConfigChangeListener).toHaveBeenCalledTimes(1);
        expect(mocks.api.removeDeviceListener).toHaveBeenCalledTimes(1);
        expect(mocks.api.removeDeviceChangeListener).toHaveBeenCalledTimes(1);
        expect(mocks.api.removeSensorListener).toHaveBeenCalledTimes(1);
        expect(mocks.api.removeBatteryListener).toHaveBeenCalledTimes(1);
        expect(mocks.api.removeCapabilityListener).toHaveBeenCalledTimes(1);
    });

    describe("handleConfigChange", () => {
        test("device config change", async () => {
            renderHook(useNotification);

            expect(mocks.api.addConfigChangeListener).toHaveBeenCalledTimes(1);

            const event: ConfigStatusMessage = {
                type: ConfigFileType.Devices,
            };

            const handleConfigChange = mocks.api.addConfigChangeListener.mock.calls[0][0];
            await act(() => handleConfigChange(event));

            expect(mocks.queryClient.invalidateQueries).toHaveBeenCalledTimes(2);
            expect(mocks.queryClient.invalidateQueries).toHaveBeenCalledWith({
                queryKey: ["powerpi", "devices"],
            });
            expect(mocks.queryClient.invalidateQueries).toHaveBeenCalledWith({
                queryKey: ["powerpi", "sensors"],
            });
        });

        test("floorplan config change", async () => {
            renderHook(useNotification);

            expect(mocks.api.addConfigChangeListener).toHaveBeenCalledTimes(1);

            const event: ConfigStatusMessage = {
                type: ConfigFileType.Floorplan,
            };

            const handleConfigChange = mocks.api.addConfigChangeListener.mock.calls[0][0];
            await act(() => handleConfigChange(event));

            expect(mocks.queryClient.invalidateQueries).not.toHaveBeenCalled();
        });
    });

    test("handleDeviceStatusChange", async () => {
        renderHook(useNotification);

        expect(mocks.api.addDeviceListener).toHaveBeenCalledTimes(1);

        const now = new Date().getTime();
        const event: DeviceStatusMessage = {
            device: "MyDevice",
            state: DeviceState.On,
            additionalState: {
                brightness: 100,
            },
            timestamp: now,
        };

        const handleDeviceStatusChange = mocks.api.addDeviceListener.mock.calls[0][0];
        await act(() => handleDeviceStatusChange(event));

        expect(mocks.patchDevice).toHaveBeenCalledTimes(1);
        expect(mocks.patchDevice).toHaveBeenCalledWith("MyDevice", {
            type: "State",
            state: DeviceState.On,
            additionalState: { brightness: 100 },
            since: now,
        });

        expect(mocks.setChangingState).toHaveBeenCalledTimes(1);
        expect(mocks.setChangingState).toHaveBeenCalledWith("MyDevice", false);
    });

    test("handleDeviceChange", async () => {
        renderHook(useNotification);

        expect(mocks.api.addDeviceChangeListener).toHaveBeenCalledTimes(1);

        const now = new Date().getTime();
        const event: DeviceChangeMessage = {
            device: "MyDevice",
            state: DeviceState.On,

            brightness: 100,

            timestamp: now,
        };

        const handleDeviceChange = mocks.api.addDeviceChangeListener.mock.calls[0][0];
        await act(() => handleDeviceChange(event));

        expect(mocks.patchDevice).toHaveBeenCalledTimes(1);
        expect(mocks.patchDevice).toHaveBeenCalledWith("MyDevice", {
            type: "State",
            state: DeviceState.Unknown,
            since: now,
        });

        expect(mocks.setChangingState).toHaveBeenCalledTimes(1);
        expect(mocks.setChangingState).toHaveBeenCalledWith("MyDevice", true);
    });

    describe("handleSensorStatusChange", () => {
        test("state", async () => {
            renderHook(useNotification);

            expect(mocks.api.addSensorListener).toHaveBeenCalledTimes(1);

            const now = new Date().getTime();
            const event: SensorStatusMessage = {
                sensor: "MyMotionSensor",
                action: "motion",
                state: "detected",
                timestamp: now,
            };

            const handleSensorStatusChange = mocks.api.addSensorListener.mock.calls[0][0];
            await act(() => handleSensorStatusChange(event));

            expect(mocks.patchSensor).toHaveBeenCalledTimes(1);
            expect(mocks.patchSensor).toHaveBeenCalledWith("MyMotionSensor", {
                type: "State",
                data: {
                    motion: {
                        state: "detected",
                        since: now,
                    },
                },
            });
        });

        test("data", async () => {
            renderHook(useNotification);

            expect(mocks.api.addSensorListener).toHaveBeenCalledTimes(1);

            const now = new Date().getTime();
            const event: SensorStatusMessage = {
                sensor: "MyTempSensor",
                action: "temperature",
                value: 31,
                unit: "°C",
                timestamp: now,
            };

            const handleSensorStatusChange = mocks.api.addSensorListener.mock.calls[0][0];
            await act(() => handleSensorStatusChange(event));

            expect(mocks.patchSensor).toHaveBeenCalledTimes(1);
            expect(mocks.patchSensor).toHaveBeenCalledWith("MyTempSensor", {
                type: "Data",
                data: {
                    temperature: {
                        value: 31,
                        unit: "°C",
                        since: now,
                    },
                },
            });
        });
    });

    describe("handleBatteryChange", () => {
        test("device", async () => {
            renderHook(useNotification);

            expect(mocks.api.addBatteryListener).toHaveBeenCalledTimes(1);

            const now = new Date().getTime();
            const event: BatteryStatusMessage = {
                device: "MyDevice",
                battery: 10,
                charging: true,
                timestamp: now,
            };

            const handleBatteryChange = mocks.api.addBatteryListener.mock.calls[0][0];
            await act(() => handleBatteryChange(event));

            expect(mocks.patchDevice).toHaveBeenCalledTimes(1);
            expect(mocks.patchDevice).toHaveBeenCalledWith("MyDevice", {
                type: "Battery",
                battery: 10,
                charging: true,
                batterySince: now,
            });
            expect(mocks.patchSensor).not.toHaveBeenCalled();
        });

        test("sensor", async () => {
            renderHook(useNotification);

            expect(mocks.api.addBatteryListener).toHaveBeenCalledTimes(1);

            const now = new Date().getTime();
            const event: BatteryStatusMessage = {
                sensor: "MySensor",
                battery: 10,
                charging: true,
                timestamp: now,
            };

            const handleBatteryChange = mocks.api.addBatteryListener.mock.calls[0][0];
            await act(() => handleBatteryChange(event));

            expect(mocks.patchSensor).toHaveBeenCalledTimes(1);
            expect(mocks.patchSensor).toHaveBeenCalledWith("MySensor", {
                type: "Battery",
                battery: 10,
                charging: true,
                batterySince: now,
            });
            expect(mocks.patchDevice).not.toHaveBeenCalled();
        });
    });

    test("handleCapabilityChange", async () => {
        renderHook(useNotification);

        expect(mocks.api.addCapabilityListener).toHaveBeenCalledTimes(1);

        const now = new Date().getTime();
        const event: CapabilityStatusMessage = {
            device: "MyDevice",
            capability: {
                brightness: true,
                colour: { temperature: true },
            },
            timestamp: now,
        };

        const handleCapabilityChange = mocks.api.addCapabilityListener.mock.calls[0][0];
        await act(() => handleCapabilityChange(event));

        expect(mocks.patchDevice).toHaveBeenCalledTimes(1);
        expect(mocks.patchDevice).toHaveBeenCalledWith("MyDevice", {
            type: "Capability",
            capability: {
                brightness: true,
                colour: { temperature: true },
            },
            since: now,
        });
    });
});
