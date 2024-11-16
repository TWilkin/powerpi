import { Device, DeviceState } from "@powerpi/common-api";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook } from "@testing-library/react";
import { PropsWithChildren, Suspense } from "react";
import { vi } from "vitest";
import useMutateDeviceState from "./useMutateDeviceState";

const mocks = vi.hoisted(() => ({
    api: {
        postDeviceChange: vi.fn(),
    },
    patchDevice: vi.fn(),
    setChangingState: vi.fn(),
}));

vi.mock("./useAPI", () => ({ default: () => mocks.api }));
vi.mock("./useDevicePatcher", () => ({ default: () => mocks.patchDevice }));
vi.mock("./notifications", () => ({
    useDeviceChangingState: () => ({ setChangingState: mocks.setChangingState }),
}));

const device: Device = {
    name: "MyDevice",
    state: DeviceState.Off,
    since: 0,
    display_name: "",
    visible: true,
    type: "socket",
};

type WrapperProps = PropsWithChildren<unknown>;

const Wrapper = ({ children }: WrapperProps) => (
    <QueryClientProvider client={new QueryClient()}>
        <Suspense>{children}</Suspense>
    </QueryClientProvider>
);

describe("useMutateDeviceState", () => {
    beforeEach(() => vi.resetAllMocks());

    test("changes state", async () => {
        const { result } = renderHook(() => useMutateDeviceState(device), {
            wrapper: Wrapper,
        });

        await act(() => result.current.mutateAsync({ newState: DeviceState.On }));

        expect(mocks.patchDevice).toHaveBeenCalledWith("MyDevice", {
            state: DeviceState.Unknown,
            since: expect.anything(),
        });

        expect(mocks.api.postDeviceChange).toHaveBeenCalledWith(
            "MyDevice",
            DeviceState.On,
            undefined,
        );

        expect(mocks.setChangingState).toHaveBeenCalledWith("MyDevice", true);
    });

    test("changes additional state", async () => {
        const { result } = renderHook(() => useMutateDeviceState(device), {
            wrapper: Wrapper,
        });

        await act(() => result.current.mutateAsync({ newAdditionalState: { brightness: 50 } }));

        expect(mocks.patchDevice).not.toHaveBeenCalled();

        expect(mocks.api.postDeviceChange).toHaveBeenCalledWith(
            "MyDevice",
            undefined,
            expect.objectContaining({ brightness: 50 }),
        );

        expect(mocks.setChangingState).toHaveBeenCalledWith("MyDevice", true);
    });

    test("changes both", async () => {
        const { result } = renderHook(() => useMutateDeviceState(device), {
            wrapper: Wrapper,
        });

        await act(() =>
            result.current.mutateAsync({
                newState: DeviceState.On,
                newAdditionalState: { temperature: 50 },
            }),
        );

        expect(mocks.patchDevice).toHaveBeenCalledWith("MyDevice", {
            state: DeviceState.Unknown,
            since: expect.anything(),
        });

        expect(mocks.api.postDeviceChange).toHaveBeenCalledWith(
            "MyDevice",
            DeviceState.On,
            expect.objectContaining({ temperature: 50 }),
        );

        expect(mocks.setChangingState).toHaveBeenCalledWith("MyDevice", true);
    });

    test("does nothing when invalid", async () => {
        const { result } = renderHook(() => useMutateDeviceState(device), {
            wrapper: Wrapper,
        });

        await act(() => result.current.mutateAsync({}));

        expect(mocks.patchDevice).not.toHaveBeenCalled();
        expect(mocks.api.postDeviceChange).not.toHaveBeenCalled();
        expect(mocks.setChangingState).not.toHaveBeenCalled();
    });
});
