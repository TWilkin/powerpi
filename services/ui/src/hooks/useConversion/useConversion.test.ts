import { act, renderHook } from "@testing-library/react";
import { vi } from "vitest";
import useConversion from "./useConversion";

const mocks = vi.hoisted(() => ({
    useUserSettings: vi.fn(),
}));

vi.mock("../useUserSettings", async () => ({
    default: mocks.useUserSettings,
}));

describe("useConversion", () => {
    test("no conversion necessary", async () => {
        mocks.useUserSettings.mockImplementation(() => ({ settings: { units: {} } }));

        const { result } = renderHook(useConversion);

        expect(result.current).toBeDefined();

        const conversion = await act(() =>
            result.current("temperature", { value: 10, unit: "°C" }),
        );
        expect(conversion).toStrictEqual({ value: 10, unit: "°C" });
    });

    test("conversion necessary", async () => {
        mocks.useUserSettings.mockImplementation(() => ({
            settings: { units: { temperature: "°C" } },
        }));

        const { result } = renderHook(useConversion);

        expect(result.current).toBeDefined();

        const conversion = await act(() => result.current("temperature", { value: 10, unit: "K" }));
        expect(conversion).toStrictEqual({ value: -273.15 + 10, unit: "°C" });
    });
});
