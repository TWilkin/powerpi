import { Config } from "@powerpi/common-api";
import { renderHook } from "@testing-library/react";
import { vi } from "vitest";
import useOptionalRoute from "./useOptionalRoute";

const mocks = vi.hoisted(() => ({
    useConfig: vi.fn(),
}));

vi.mock("../queries/useQueryConfig", () => ({ default: mocks.useConfig }));

describe("useOptionalRoute", () => {
    test("no data", () => {
        mocks.useConfig.mockReturnValue({ data: undefined });

        const { result } = renderHook(useOptionalRoute);

        expect(result.current).toBeUndefined();
    });

    const cases: { data?: Partial<Config>; expected: ReturnType<typeof useOptionalRoute> }[] = [
        {
            data: { hasFloorplan: false, hasDevices: false },
            expected: { home: false, device: false },
        },
        {
            data: { hasFloorplan: true, hasDevices: false },
            expected: { home: true, device: false },
        },
        {
            data: { hasFloorplan: false, hasDevices: true },
            expected: { home: false, device: true },
        },
    ];
    test.each(cases)("when $data then $expected", ({ data, expected }) => {
        mocks.useConfig.mockReturnValue({ data });

        const { result } = renderHook(useOptionalRoute);

        expect(result.current).toStrictEqual(expected);
    });
});
