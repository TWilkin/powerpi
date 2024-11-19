import { render, screen } from "@testing-library/react";
import { PropsWithChildren } from "react";
import { MemoryRouter, Route, Routes, To } from "react-router-dom";
import { vi } from "vitest";
import DefaultRoute from "./DefaultRoute";

vi.mock("react-router-dom", async () => ({
    ...(await vi.importActual("react-router-dom")),
    Navigate: ({ to }: { to: To }) => <div>Redirected {to as string}</div>,
}));

const mocks = vi.hoisted(() => ({
    useOptionalRoute: vi.fn(),
}));

vi.mock("./useOptionalRoute", () => ({ default: mocks.useOptionalRoute }));

const Wrapper = ({ children }: PropsWithChildren<unknown>) => (
    <MemoryRouter initialEntries={["/"]}>
        <Routes>
            <Route path="/" element={children} />
        </Routes>
    </MemoryRouter>
);

describe("DefaultRoute", () => {
    test("fallback to login", () => {
        render(<DefaultRoute />, { wrapper: Wrapper });

        expect(screen.getByText("Redirected login")).toBeInTheDocument();
    });

    test("defaults to home when enabled", () => {
        mocks.useOptionalRoute.mockReturnValue({ home: true, device: true });

        render(<DefaultRoute />, { wrapper: Wrapper });

        expect(screen.getByText("Redirected home")).toBeInTheDocument();
    });

    test("defaults to devices when home disabled", () => {
        mocks.useOptionalRoute.mockReturnValue({ home: false, device: true });

        render(<DefaultRoute />, { wrapper: Wrapper });

        expect(screen.getByText("Redirected device")).toBeInTheDocument();
    });
});
