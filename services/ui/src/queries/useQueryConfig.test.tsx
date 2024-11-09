import { Config, PowerPiApi } from "@powerpi/common-api";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { PropsWithChildren, Suspense } from "react";
import { vi } from "vitest";
import useQueryConfig, { configLoader } from "./useQueryConfig";

const mocks = vi.hoisted(() => ({
    api: {
        getConfig: vi.fn(),
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

const data: Config = {
    hasDevices: true,
    hasSensors: true,
    hasFloorplan: false,
    hasPersistence: false,
};

describe("configLoader", () =>
    test("works", async () => {
        mocks.api.getConfig.mockImplementation(async () => data);

        const loader = configLoader(new QueryClient(), mocks.api as unknown as PowerPiApi);

        const result = await loader().data.data;
        expect(result).toBe(data);
    }));

describe("useQueryConfig", () => {
    test("works", async () => {
        mocks.api.getConfig.mockImplementation(async () => data);

        const { result } = renderHook(useQueryConfig, {
            wrapper: Wrapper,
        });

        await waitFor(() => expect(result.current.data).toBe(data));
    });

    test("works when throwing", async () => {
        mocks.api.getConfig.mockImplementation(async () => {
            throw new Error("Nope");
        });

        const { result } = renderHook(useQueryConfig, {
            wrapper: Wrapper,
        });

        await waitFor(() =>
            expect(result.current.data).toStrictEqual({
                hasDevices: false,
                hasSensors: false,
                hasFloorplan: false,
                hasPersistence: false,
            }),
        );
    });
});
