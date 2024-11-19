import { Floorplan, PowerPiApi } from "@powerpi/common-api";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { PropsWithChildren, Suspense } from "react";
import { vi } from "vitest";
import useQueryFloorplan, { floorplanLoader } from "./useQueryFloorPlan";

const mocks = vi.hoisted(() => ({
    api: {
        getFloorplan: vi.fn(),
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

const data: Floorplan = {
    floors: [],
};

describe("floorplanLoader", () => {
    test("works", async () => {
        mocks.api.getFloorplan.mockImplementation(async () => data);

        const loader = floorplanLoader(new QueryClient(), mocks.api as unknown as PowerPiApi);

        const result = await loader().data.data;
        expect(result).toBe(data);
    });
});

describe("useQueryFloorplan", () => {
    test("works", async () => {
        mocks.api.getFloorplan.mockImplementation(async () => data);

        const { result } = renderHook(useQueryFloorplan, {
            wrapper: Wrapper,
        });

        await waitFor(() => expect(result.current?.data).toBe(data));
    });
});
