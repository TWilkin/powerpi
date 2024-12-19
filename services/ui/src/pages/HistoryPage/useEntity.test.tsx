import { renderHook } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";
import useEntity from "./useEntity";

describe("useEntity", () => {
    const entity: { entity: string | undefined; expected: string | undefined }[] = [
        { entity: undefined, expected: undefined },
        { entity: "MyDevice", expected: "MyDevice" },
    ];
    test.each(entity)("$expected", ({ entity, expected }) => {
        const { result } = renderHook(useEntity, {
            wrapper: ({ children }) => (
                <MemoryRouter initialEntries={[entity ? `/${entity}` : ""]}>
                    <Routes>
                        <Route path="/" element={children} />
                        <Route path="/:entity" element={children} />
                    </Routes>
                </MemoryRouter>
            ),
        });

        expect(result.current).toBe(expected);
    });
});
