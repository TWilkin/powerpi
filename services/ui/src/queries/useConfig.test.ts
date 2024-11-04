import { Config, PowerPiApi } from "@powerpi/common-api";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import useConfig, { configLoader } from "./useConfig";

const mocks = vi.hoisted(() => ({
    api: {
        getConfig: vi.fn(),
    },
}));

vi.mock("./useAPI", () => ({ default: () => mocks.api }));

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

        const result = await loader();

        expect(result).toBe(data);
    }));

describe("useConfig", () =>
    test("works", async () => {
        mocks.api.getConfig.mockImplementation(async () => data);

        const { result } = renderHook(useConfig, {
            wrapper: (props) => QueryClientProvider({ ...props, client: new QueryClient() }),
        });

        await waitFor(() => expect(result.current.data).toBe(data));
    }));
