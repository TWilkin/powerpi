import { Device, DeviceState } from "@powerpi/common-api";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook } from "@testing-library/react";
import { PropsWithChildren, Suspense } from "react";
import QueryKeyFactory from "./QueryKeyFactory";
import useDevicePatcher from "./useDevicePatcher";

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

describe("useDevicePatcher", () =>
    test("works", async () => {
        const queryClient = new QueryClient();
        queryClient.setQueryData(QueryKeyFactory.devices, (_: Device[]) => [
            { name: "SomethingElse" },
            device,
        ]);

        const { result } = renderHook(useDevicePatcher, {
            wrapper: ({ children }) => Wrapper({ children, queryClient }),
        });

        expect(queryClient.getQueryData<Device[]>(QueryKeyFactory.devices)![1].state).toBe(
            DeviceState.Off,
        );

        const since = new Date().getTime();
        act(() => result.current("MyDevice", { state: DeviceState.On, since }));

        expect(queryClient.getQueryData<Device[]>(QueryKeyFactory.devices)![1].state).toBe(
            DeviceState.On,
        );
        expect(queryClient.getQueryData<Device[]>(QueryKeyFactory.devices)![1].since).toBe(since);
    }));
