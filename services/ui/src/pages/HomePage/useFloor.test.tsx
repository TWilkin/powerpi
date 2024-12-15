import { renderHook } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";
import useFloor from "./useFloor";

describe("useFloor", () => {
    const floor: { floor: string | undefined; expected: string }[] = [
        { floor: undefined, expected: "" },
        { floor: "Ground", expected: "Ground" },
        { floor: "First%20Floor", expected: "First Floor" },
    ];
    test.each(floor)("$expected", ({ floor, expected }) => {
        const { result } = renderHook(useFloor, {
            wrapper: ({ children }) => (
                <MemoryRouter initialEntries={[floor ? `/${floor}` : ""]}>
                    <Routes>
                        <Route path="/" element={children} />
                        <Route path={"/:floor"} element={children} />
                    </Routes>
                </MemoryRouter>
            ),
        });

        expect(result.current).toBe(expected);
    });
});
