import { AdditionalState, Capability, Device, DeviceState } from "@powerpi/common-api";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook } from "@testing-library/react";
import { PropsWithChildren, Suspense } from "react";
import QueryKeyFactory from "./QueryKeyFactory";
import useDevicePatcher, { DeviceStatePatch } from "./useDevicePatcher";

type WrapperProps = PropsWithChildren<{ queryClient: QueryClient }>;

const Wrapper = ({ queryClient, children }: WrapperProps) => (
    <QueryClientProvider client={queryClient}>
        <Suspense>{children}</Suspense>
    </QueryClientProvider>
);

describe("useDevicePatcher", () => {
    const device: Device = {
        name: "MyDevice",
        type: "socket",
        display_name: "",
        state: DeviceState.Off,
        additionalState: {
            brightness: 50,
        },
        since: 0,
        visible: true,
        capability: {
            brightness: true,
        },
    };

    const cases: {
        name: string;
        update: Omit<DeviceStatePatch, "since">;
        expectedState?: DeviceState;
        expectedAdditionalState?: AdditionalState;
        expectedCapability?: Capability;
    }[] = [
        { name: "updates state", update: { state: DeviceState.On }, expectedState: DeviceState.On },
        {
            name: "updates additional state",
            update: { additionalState: { brightness: 60 } },
            expectedAdditionalState: { brightness: 60 },
        },
        {
            name: "updates capability",
            update: { capability: { brightness: false } },
            expectedCapability: { brightness: false },
        },
    ];
    test.each(cases)(
        "$name",
        ({ update, expectedState, expectedAdditionalState, expectedCapability }) => {
            const queryClient = new QueryClient();
            queryClient.setQueryData(QueryKeyFactory.devices, (_: Device[]) => [
                { name: "SomethingElse" },
                { ...device },
            ]);

            const { result } = renderHook(useDevicePatcher, {
                wrapper: ({ children }) => Wrapper({ children, queryClient }),
            });

            // check they have the expected initial value
            expect(queryClient.getQueryData<Device[]>(QueryKeyFactory.devices)![1].state).toBe(
                DeviceState.Off,
            );

            expect(
                queryClient.getQueryData<Device[]>(QueryKeyFactory.devices)![1].additionalState,
            ).toStrictEqual({ brightness: 50 });

            expect(
                queryClient.getQueryData<Device[]>(QueryKeyFactory.devices)![1].capability,
            ).toStrictEqual({ brightness: true });

            // send the patch
            const since = new Date().getTime();
            act(() => result.current("MyDevice", { ...update, since }));

            // check they have the expected updated value
            expect(queryClient.getQueryData<Device[]>(QueryKeyFactory.devices)![1].state).toBe(
                expectedState ?? DeviceState.Off,
            );

            expect(
                queryClient.getQueryData<Device[]>(QueryKeyFactory.devices)![1].additionalState,
            ).toStrictEqual(expectedAdditionalState ?? { brightness: 50 });

            expect(
                queryClient.getQueryData<Device[]>(QueryKeyFactory.devices)![1].capability,
            ).toStrictEqual(expectedCapability ?? { brightness: true });

            expect(queryClient.getQueryData<Device[]>(QueryKeyFactory.devices)![1].since).toBe(
                since,
            );
        },
    );
});
