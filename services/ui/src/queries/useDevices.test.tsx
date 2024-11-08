import { Device, DeviceState, PowerPiApi } from "@powerpi/common-api";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { PropsWithChildren, Suspense } from "react";
import { vi } from "vitest";
import useDevices, { devicesLoader } from "./useDevices";

const mocks = vi.hoisted(() => ({
    api: {
        getDevices: vi.fn(),
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

const data: Device[] = [
    {
        state: DeviceState.On,
        since: 0,
        name: "Device",
        display_name: "Device",
        visible: true,
        type: "socket",
    },
];

describe("devicesLoader", () =>
    test("works", async () => {
        mocks.api.getDevices.mockImplementation(async () => data);

        const loader = devicesLoader(new QueryClient(), mocks.api as unknown as PowerPiApi);

        const result = await loader().data.data;
        expect(result).toBe(data);
    }));

describe("useDevices", () =>
    test("works", async () => {
        mocks.api.getDevices.mockImplementation(async () => data);

        const { result } = renderHook(useDevices, {
            wrapper: Wrapper,
        });

        await waitFor(() => expect(result.current?.data).toBe(data));
    }));
