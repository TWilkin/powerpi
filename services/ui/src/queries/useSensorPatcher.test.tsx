import { Sensor } from "@powerpi/common-api";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook } from "@testing-library/react";
import { PropsWithChildren, Suspense } from "react";
import QueryKeyFactory from "./QueryKeyFactory";
import useSensorPatcher, { SensorPatch } from "./useSensorPatcher";

type WrapperProps = PropsWithChildren<{ queryClient: QueryClient }>;

const Wrapper = ({ queryClient, children }: WrapperProps) => (
    <QueryClientProvider client={queryClient}>
        <Suspense>{children}</Suspense>
    </QueryClientProvider>
);

describe("useSensorPatcher", () => {
    const since = new Date().getTime();

    const sensor: Sensor = {
        name: "MySensor",
        display_name: "My Sensor",
        type: "temperature",
        visible: true,
        state: "hot",
        value: 31,
        unit: "°C",
        battery: 2,
        charging: false,
        batterySince: 0,
        since: 0,
    };

    const cases: {
        name: string;
        update: SensorPatch;
        expectedState?: string;
        expectedValue?: number;
        expectedUnit?: string;
        expectedBattery?: Pick<Sensor, "battery" | "charging">;
    }[] = [
        {
            name: "updates state",
            update: { type: "State", state: "cold", since },
            expectedState: "cold",
        },
        {
            name: "updates data",
            update: { type: "Data", value: 87.8, unit: "F", since },
            expectedValue: 87.8,
            expectedUnit: "F",
        },
        {
            name: "updates battery",
            update: { type: "Battery", battery: 3, charging: true, batterySince: since },
            expectedBattery: { battery: 3, charging: true },
        },
    ];
    test.each(cases)(
        "$name",
        ({ update, expectedState, expectedValue, expectedUnit, expectedBattery }) => {
            const queryClient = new QueryClient();
            queryClient.setQueryData(QueryKeyFactory.sensors, (_: Sensor[]) => [
                { name: "SomethingElse" },
                { ...sensor },
            ]);

            const { result } = renderHook(useSensorPatcher, {
                wrapper: ({ children }) => Wrapper({ children, queryClient }),
            });

            let cacheSensor = queryClient.getQueryData<Sensor[]>(QueryKeyFactory.sensors)![1];
            expect(cacheSensor.state).toBe("hot");
            expect(cacheSensor.value).toBe(31);
            expect(cacheSensor.unit).toBe("°C");
            expect(cacheSensor.battery).toBe(2);
            expect(cacheSensor.charging).toBeFalsy();

            // send the patch
            act(() => result.current("MySensor", update));

            // check they have the expected updated value
            cacheSensor = queryClient.getQueryData<Sensor[]>(QueryKeyFactory.sensors)![1];
            expect(cacheSensor.state).toBe(expectedState ?? "hot");
            expect(cacheSensor.value).toBe(expectedValue ?? 31);
            expect(cacheSensor.unit).toBe(expectedUnit ?? "°C");
            expect(cacheSensor.battery).toBe(expectedBattery?.battery ?? 2);
            expect(cacheSensor.charging).toBe(expectedBattery?.charging ?? false);

            if (!expectedBattery) {
                expect(cacheSensor.since).toBe(since);

                expect(cacheSensor.batterySince).toBe(0);
            } else {
                expect(cacheSensor.since).toBe(0);

                expect(cacheSensor.batterySince).toBe(since);
            }

            // check other values persist
            expect(cacheSensor.type).toBe("temperature");
        },
    );
});
