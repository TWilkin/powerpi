import { act, renderHook } from "@testing-library/react";
import usePanel from "./usePanel";

describe("usePanel", () => {
    test("toggles", () => {
        const { result } = renderHook(usePanel);

        expect(result.current.open).toBeFalsy();

        act(result.current.handleToggle);
        expect(result.current.open).toBeTruthy();

        act(result.current.handleToggle);
        expect(result.current.open).toBeFalsy();
    });
});
