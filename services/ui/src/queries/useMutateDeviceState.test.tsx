import { Device, DeviceState } from "@powerpi/common-api";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook } from "@testing-library/react";
import { PropsWithChildren, Suspense } from "react";
import { vi } from "vitest";
import QueryKeyFactory from "./QueryKeyFactory";
import useMutateDeviceState from "./useMutateDeviceState";

const mocks = vi.hoisted(() => ({
    api: {
        postDeviceChange: vi.fn(),
    },
}));

vi.mock("./useAPI", () => ({ default: () => mocks.api }));

const device: Device = {
    name: "MyDevice",
    state: DeviceState.Off,
    since: 0,
    display_name: "",
    visible: true,
    type: "socket",
};

type WrapperProps = PropsWithChildren<{ queryClient: QueryClient }>;

const Wrapper = ({ queryClient, children }: WrapperProps) => (
    <QueryClientProvider client={queryClient}>
        <Suspense>{children}</Suspense>
    </QueryClientProvider>
);

describe("useMutateDeviceState", () =>
    test("works", async () => {
        const queryClient = new QueryClient();
        queryClient.setQueryData(QueryKeyFactory.devices, (_: Device[]) => [
            { name: "SomethingElse" },
            device,
        ]);

        const { result } = renderHook(() => useMutateDeviceState(device), {
            wrapper: ({ children }) => Wrapper({ children, queryClient }),
        });

        expect(queryClient.getQueryData<Device[]>(QueryKeyFactory.devices)![1].state).toBe(
            DeviceState.Off,
        );

        await act(() => result.current.mutateAsync(DeviceState.On));

        expect(mocks.api.postDeviceChange).toHaveBeenCalledWith("MyDevice", DeviceState.On);

        expect(queryClient.getQueryData<Device[]>(QueryKeyFactory.devices)![1].state).toBe(
            DeviceState.On,
        );
    }));
