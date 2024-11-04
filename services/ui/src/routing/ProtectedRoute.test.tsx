import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { PropsWithChildren } from "react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { vi } from "vitest";
import ProtectedRoute from "./ProtectedRoute";

vi.mock("react-router-dom", async () => ({
    ...(await vi.importActual("react-router-dom")),
    Navigate: () => <div>Not logged in</div>,
}));

const mocks = vi.hoisted(() => ({
    useUser: vi.fn(),
}));

vi.mock("../hooks/useUser", () => ({ default: mocks.useUser }));

const Wrapper = ({ children }: PropsWithChildren<unknown>) => (
    <MemoryRouter initialEntries={["/protected"]}>
        <Routes>
            <Route path="/" element={children}>
                <Route path="protected" element={<div>Logged in</div>} />
            </Route>
        </Routes>
    </MemoryRouter>
);

describe("ProtectedRoute", () => {
    afterEach(() => vi.clearAllMocks());

    test("redirects when not logged in", () => {
        mocks.useUser.mockReturnValue(undefined);

        render(<ProtectedRoute />, { wrapper: Wrapper });

        expect(screen.getByText("Not logged in")).toBeInTheDocument();
    });

    test("shows element when logged in", () => {
        mocks.useUser.mockReturnValue("someone@example.com");

        render(<ProtectedRoute />, { wrapper: Wrapper });

        expect(screen.getByText("Logged in")).toBeInTheDocument();
    });
});
