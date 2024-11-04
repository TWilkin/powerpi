import "@testing-library/jest-dom";
import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { PropsWithChildren } from "react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { vi } from "vitest";
import OptionalRoute from "./OptionalRoute";

vi.mock("react-router-dom", async () => ({
    ...(await vi.importActual("react-router-dom")),
    Navigate: () => <div>Disabled</div>,
}));

const mocks = vi.hoisted(() => ({
    useOptionalRoute: vi.fn(),
}));

vi.mock("./useOptionalRoute", () => ({ default: mocks.useOptionalRoute }));

const Wrapper = ({ children }: PropsWithChildren<unknown>) => (
    <MemoryRouter initialEntries={["/home"]}>
        <Routes>
            <Route path="/" element={children}>
                <Route path="home" element={<div>Enabled</div>} />
            </Route>
        </Routes>
    </MemoryRouter>
);

describe("OptionalRoute", () => {
    afterEach(() => vi.clearAllMocks());

    test("does nothing while loading", () => {
        mocks.useOptionalRoute.mockReturnValue(undefined);

        render(<OptionalRoute />, { wrapper: Wrapper });

        expect(screen.queryByText("Enabled")).not.toBeInTheDocument();
        expect(screen.queryByText("Disabled")).not.toBeInTheDocument();
    });

    test("redirects when disabled", () => {
        mocks.useOptionalRoute.mockReturnValue({ home: false });

        render(<OptionalRoute />, { wrapper: Wrapper });

        expect(screen.getByText("Disabled")).toBeInTheDocument();
    });

    test("shows element when enabled", () => {
        mocks.useOptionalRoute.mockReturnValue({ home: true });

        render(<OptionalRoute />, { wrapper: Wrapper });

        expect(screen.getByText("Enabled")).toBeInTheDocument();
    });
});
