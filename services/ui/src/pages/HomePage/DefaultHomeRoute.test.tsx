import { render, screen } from "@testing-library/react";
import { PropsWithChildren } from "react";
import { MemoryRouter, Route, Routes, To } from "react-router-dom";
import { vi } from "vitest";
import DefaultHomeRoute from "./DefaultHomeRoute";

vi.mock("react-router-dom", async () => ({
    ...(await vi.importActual("react-router-dom")),
    Navigate: ({ to }: { to: To }) => <div>Redirected {to as string}</div>,
}));

const mocks = vi.hoisted(() => ({
    useQueryFloorplan: vi.fn(),
}));

vi.mock("../../queries/useQueryFloorPlan", () => ({ default: mocks.useQueryFloorplan }));

const Wrapper = ({ children }: PropsWithChildren<unknown>) => (
    <MemoryRouter initialEntries={["/"]}>
        <Routes>
            <Route path="/" element={children} />
        </Routes>
    </MemoryRouter>
);

describe("DefaultHomeRoute", () => {
    test("works", () => {
        mocks.useQueryFloorplan.mockReturnValue({
            data: {
                floors: [{ name: "ground" }, { name: "first" }],
            },
        });

        render(<DefaultHomeRoute />, { wrapper: Wrapper });

        expect(screen.getByText("Redirected ground")).toBeInTheDocument();
    });
});
