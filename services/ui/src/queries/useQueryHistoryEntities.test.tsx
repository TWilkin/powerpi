import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { PropsWithChildren, Suspense } from "react";
import { vi } from "vitest";
import useQueryHistoryEntities from "./useQueryHistoryEntities";

const mocks = vi.hoisted(() => ({
    api: {
        getHistoryEntities: vi.fn(),
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

describe("useQueryHistoryEntities", () => {
    test("works", async () => {
        const data = [{ entity: "A" }, { entity: "B" }];
        mocks.api.getHistoryEntities.mockImplementation(async () => data);

        const { result } = renderHook(useQueryHistoryEntities, { wrapper: Wrapper });

        await waitFor(() => expect(result.current.data).toStrictEqual(["A", "B"]));
    });
});
