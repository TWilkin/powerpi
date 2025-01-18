import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { PropsWithChildren, Suspense } from "react";
import { vi } from "vitest";
import useQueryHistoryTypes from "./useQueryHistoryTypes";

const mocks = vi.hoisted(() => ({
    api: {
        getHistoryTypes: vi.fn(),
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

describe("useQueryHistoryTypes", () => {
    test("works", async () => {
        const data = [{ type: "A" }, { type: "B" }];
        mocks.api.getHistoryTypes.mockImplementation(async () => data);

        const { result } = renderHook(useQueryHistoryTypes, { wrapper: Wrapper });

        await waitFor(() => expect(result.current.data).toStrictEqual(["A", "B"]));
    });
});
