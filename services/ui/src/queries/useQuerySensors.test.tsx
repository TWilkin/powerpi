import { PowerPiApi, Sensor } from "@powerpi/common-api";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { PropsWithChildren, Suspense } from "react";
import { vi } from "vitest";
import useQuerySensors, { sensorsLoader } from "./useQuerySensors";

const mocks = vi.hoisted(() => ({
    api: {
        getSensors: vi.fn(),
    },
}));

vi.mock("./useAPI", () => ({ default: () => mocks.api }));

const Wrapper = ({ children }: PropsWithChildren<unknown>) => {
    const queryClient = new QueryClient();
    return (
        <QueryClientProvider client={queryClient}>
            <Suspense>{children}</Suspense>
        </QueryClientProvider>
    );
};

const data: Sensor[] = [
    {
        name: "MySensor",
        display_name: "My Sensor",
        type: "temperature",
        data: {},
        visible: true,
    },
];

describe("sensorsLoader", () => {
    test("works", async () => {
        mocks.api.getSensors.mockImplementation(async () => data);

        const loader = sensorsLoader(new QueryClient(), mocks.api as unknown as PowerPiApi);

        const result = (await loader()).data;
        expect(result).toBe(data);
    });
});

describe("useQuerySensors", () => {
    test("works", async () => {
        mocks.api.getSensors.mockImplementation(async () => data);

        const { result } = renderHook(useQuerySensors, {
            wrapper: Wrapper,
        });

        await waitFor(() => expect(result.current?.data).toBe(data));
    });
});
