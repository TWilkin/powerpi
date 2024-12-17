import { act, renderHook } from "@testing-library/react";
import useSlideAnimation from "./useSlideAnimation";

describe("useSlideAnimation", () => {
    test("toggles", () => {
        const { result } = renderHook(useSlideAnimation);

        expect(result.current.open).toBeFalsy();

        act(result.current.handleToggle);
        expect(result.current.open).toBeTruthy();

        act(result.current.handleToggle);
        expect(result.current.open).toBeFalsy();
    });
});
