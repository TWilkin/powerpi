import { act, renderHook } from "@testing-library/react";
import { vi } from "vitest";
import useOrientation from "./useOrientation";

describe("useOrientation", () => {
    test("mounts and unmounts", () => {
        const addEventListener = vi.fn();
        vi.stubGlobal("addEventListener", addEventListener);

        const removeEventListener = vi.fn();
        vi.stubGlobal("removeEventListener", removeEventListener);

        const matchMedia = vi.fn();
        vi.stubGlobal("matchMedia", matchMedia);
        matchMedia.mockReturnValue({ matches: true });

        const { unmount } = renderHook(useOrientation);

        expect(addEventListener).toHaveBeenCalledTimes(2);
        expect(removeEventListener).not.toHaveBeenCalled();

        act(unmount);

        expect(removeEventListener).toHaveBeenCalledTimes(2);
    });

    const cases: { condition: string; isLandscape: boolean; isPortrait: boolean }[] = [
        { condition: "(orientation: landscape)", isLandscape: true, isPortrait: false },
        { condition: "(orientation: portrait)", isLandscape: false, isPortrait: true },
        { condition: "", isLandscape: false, isPortrait: false },
    ];
    test.each(cases)(
        "landscape: $isLandscape portrait: $isPortrait",
        ({ condition, isLandscape, isPortrait }) => {
            const matchMedia = vi.fn();
            vi.stubGlobal("matchMedia", matchMedia);
            matchMedia.mockImplementation((orientation) => ({
                matches: orientation === condition,
            }));

            const { result } = renderHook(useOrientation);

            expect(result.current.isLandscape).toBe(isLandscape);
            expect(result.current.isPortrait).toBe(isPortrait);
        },
    );
});
