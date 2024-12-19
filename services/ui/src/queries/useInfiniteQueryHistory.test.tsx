import { History, PaginationResponse, PowerPiApi } from "@powerpi/common-api";
import { InfiniteData, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { PropsWithChildren, Suspense } from "react";
import { vi } from "vitest";
import useInfiniteQueryHistory, { historyLoader } from "./useInfiniteQueryHistory";

const mocks = vi.hoisted(() => ({
    api: {
        getHistory: vi.fn(),
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

const data: PaginationResponse<History> = {
    data: [
        {
            type: "type",
            entity: "entity",
            action: "action",
            timestamp: new Date().toISOString(),
            message: { key: "value" },
        },
    ],
    records: 1,
};

describe("historyLoader", () => {
    test("works", async () => {
        mocks.api.getHistory.mockImplementation(async () => data);

        const loader = historyLoader(new QueryClient(), mocks.api as unknown as PowerPiApi);

        const result = (await loader()).data;
        const page = (result as InfiniteData<PaginationResponse<History>>).pages[0];
        expect(page).toBe(data);
    });
});

describe("useInfiniteQueryHistory", () => {
    test("works", async () => {
        mocks.api.getHistory.mockImplementation(async () => data);

        const { result } = renderHook(useInfiniteQueryHistory, {
            wrapper: Wrapper,
        });

        await waitFor(() => expect(result.current?.data.pages[0]).toBe(data));
    });
});
