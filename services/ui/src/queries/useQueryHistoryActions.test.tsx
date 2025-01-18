import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { PropsWithChildren, Suspense } from "react";
import { vi } from "vitest";
import useQueryHistoryActions from "./useQueryHistoryActions";

const mocks = vi.hoisted(() => ({
    api: {
        getHistoryActions: vi.fn(),
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

describe("useQueryHistoryActions", () => {
    test("works", async () => {
        const data = [{ action: "A" }, { action: "B" }];
        mocks.api.getHistoryActions.mockImplementation(async () => data);

        const { result } = renderHook(useQueryHistoryActions, { wrapper: Wrapper });

        await waitFor(() => expect(result.current.data).toStrictEqual(["A", "B"]));
    });
});
