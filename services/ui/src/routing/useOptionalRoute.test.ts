import { Config } from "@powerpi/common-api";
import { renderHook } from "@testing-library/react";
import { vi } from "vitest";
import useOptionalRoute from "./useOptionalRoute";

const mocks = vi.hoisted(() => ({
    useConfig: vi.fn(),
}));

vi.mock("../queries/useConfig", () => ({ default: mocks.useConfig }));

describe("useOptionalRoute", () => {
    test("no data", () => {
        mocks.useConfig.mockReturnValue({ data: undefined });

        const { result } = renderHook(useOptionalRoute);

        expect(result.current).toBeUndefined();
    });

    const cases: { data?: Partial<Config>; expected: ReturnType<typeof useOptionalRoute> }[] = [
        { data: { hasFloorplan: false }, expected: { home: false } },
    ];
    test.each(cases)("when $data then $expected", ({ data, expected }) => {
        mocks.useConfig.mockReturnValue({ data });

        const { result } = renderHook(useOptionalRoute);

        expect(result.current).toStrictEqual(expected);
    });
});
