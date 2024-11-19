import { AdditionalState, Capability, Device, DeviceState } from "@powerpi/common-api";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook } from "@testing-library/react";
import { PropsWithChildren, Suspense } from "react";
import QueryKeyFactory from "./QueryKeyFactory";
import useDevicePatcher, { DevicePatch } from "./useDevicePatcher";

type WrapperProps = PropsWithChildren<{ queryClient: QueryClient }>;

const Wrapper = ({ queryClient, children }: WrapperProps) => (
    <QueryClientProvider client={queryClient}>
        <Suspense>{children}</Suspense>
    </QueryClientProvider>
);

describe("useDevicePatcher", () => {
    const since = new Date().getTime();

    const device: Device = {
        name: "MyDevice",
        type: "light",
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
        battery: 2,
        batterySince: 0,
        charging: false,
    };

    const cases: {
        name: string;
        update: DevicePatch;
        expectedState?: DeviceState;
        expectedAdditionalState?: AdditionalState;
        expectedCapability?: Capability;
        expectedBattery?: Pick<Device, "battery" | "charging">;
    }[] = [
        {
            name: "updates state",
            update: {
                type: "State",
                state: DeviceState.On,
                additionalState: { brightness: 50 },
                since,
            },
            expectedState: DeviceState.On,
        },
        {
            name: "updates additional state",
            update: {
                type: "State",
                state: DeviceState.Off,
                additionalState: { brightness: 60 },
                since,
            },
            expectedAdditionalState: { brightness: 60 },
        },
        {
            name: "updates capability",
            update: { type: "Capability", capability: { brightness: false }, since },
            expectedCapability: { brightness: false },
        },
        {
            name: "updates battery",
            update: { type: "Battery", battery: 3, charging: true, batterySince: since },
            expectedBattery: { battery: 3, charging: true },
        },
    ];
    test.each(cases)(
        "$name",
        ({
            update,
            expectedState,
            expectedAdditionalState,
            expectedCapability,
            expectedBattery,
        }) => {
            const queryClient = new QueryClient();
            queryClient.setQueryData(QueryKeyFactory.devices, (_: Device[]) => [
                { name: "SomethingElse" },
                { ...device },
            ]);

            const { result } = renderHook(useDevicePatcher, {
                wrapper: ({ children }) => Wrapper({ children, queryClient }),
            });

            // check they have the expected initial value
            let cacheDevice = queryClient.getQueryData<Device[]>(QueryKeyFactory.devices)![1];
            expect(cacheDevice.state).toBe(DeviceState.Off);
            expect(cacheDevice.additionalState).toStrictEqual({ brightness: 50 });
            expect(cacheDevice.capability).toStrictEqual({ brightness: true });
            expect(cacheDevice.battery).toBe(2);
            expect(cacheDevice.charging).toBeFalsy();

            // send the patch
            act(() => result.current("MyDevice", update));

            // check they have the expected updated value
            cacheDevice = queryClient.getQueryData<Device[]>(QueryKeyFactory.devices)![1];
            expect(cacheDevice.state).toBe(expectedState ?? DeviceState.Off);
            expect(cacheDevice.additionalState).toStrictEqual(
                expectedAdditionalState ?? { brightness: 50 },
            );
            expect(cacheDevice.capability).toStrictEqual(
                expectedCapability ?? { brightness: true },
            );

            if (!expectedBattery) {
                expect(cacheDevice.since).toBe(since);

                expect(cacheDevice.batterySince).toBe(0);
            } else {
                expect(cacheDevice.since).toBe(0);

                expect(cacheDevice.batterySince).toBe(since);
            }

            // check other values persist
            expect(cacheDevice.type).toBe("light");
        },
    );
});
