import {
    CapabilityStatusMessage,
    ConfigFileType,
    ConfigStatusMessage,
    DeviceState,
    DeviceStatusMessage,
} from "@powerpi/common-api";
import { act, renderHook } from "@testing-library/react";
import { vi } from "vitest";
import useNotification from "./useNotification";

const mocks = vi.hoisted(() => ({
    api: {
        addConfigChangeListener: vi.fn(),
        addDeviceListener: vi.fn(),
        addCapabilityListener: vi.fn(),
        removeConfigChangeListener: vi.fn(),
        removeDeviceListener: vi.fn(),
        removeCapabilityListener: vi.fn(),
    },
    patchDevice: vi.fn(),
    setChangingState: vi.fn(),
    queryClient: {
        invalidateQueries: vi.fn(),
    },
}));

vi.mock("../useAPI", () => ({ default: () => mocks.api }));
vi.mock("../useDevicePatcher", () => ({ default: () => mocks.patchDevice }));
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
    beforeEach(() => vi.resetAllMocks());

    test("mounts and unmounts", () => {
        const { unmount } = renderHook(useNotification);

        expect(mocks.api.addConfigChangeListener).toHaveBeenCalledTimes(1);
        expect(mocks.api.addDeviceListener).toHaveBeenCalledTimes(1);
        expect(mocks.api.addCapabilityListener).toHaveBeenCalledTimes(1);

        expect(mocks.api.removeConfigChangeListener).not.toHaveBeenCalled();
        expect(mocks.api.removeDeviceListener).not.toHaveBeenCalled();
        expect(mocks.api.removeCapabilityListener).not.toHaveBeenCalled();

        act(unmount);

        expect(mocks.api.removeConfigChangeListener).toHaveBeenCalledTimes(1);
        expect(mocks.api.removeDeviceListener).toHaveBeenCalledTimes(1);
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

            expect(mocks.queryClient.invalidateQueries).toHaveBeenCalledTimes(1);
            expect(mocks.queryClient.invalidateQueries).toHaveBeenCalledWith({
                queryKey: ["powerpi", "devices"],
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
            state: DeviceState.On,
            additionalState: { brightness: 100 },
            since: now,
        });

        expect(mocks.setChangingState).toHaveBeenCalledTimes(1);
        expect(mocks.setChangingState).toHaveBeenCalledWith("MyDevice", false);
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
            capability: {
                brightness: true,
                colour: { temperature: true },
            },
            since: now,
        });
    });
});
