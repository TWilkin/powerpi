import { render, screen } from "@testing-library/react";
import { vi } from "vitest";
import Logo from "./Logo";

const mocks = vi.hoisted(() => ({
    useIsFetching: vi.fn(),
}));

vi.mock("@tanstack/react-query", () => ({ useIsFetching: mocks.useIsFetching }));

describe("Logo", () => {
    test("renders", () => {
        mocks.useIsFetching.mockImplementation(() => false);

        render(<Logo />);

        const logo = screen.getByRole("img", { hidden: true });
        expect(logo).toBeInTheDocument();
        expect(logo).toHaveAttribute("data-icon", "plug");

        expect(screen.getByText("PowerPi")).toBeInTheDocument();
    });

    test("shows loading", () => {
        mocks.useIsFetching.mockImplementation(() => true);

        render(<Logo />);

        const logo = screen.getByRole("img", { hidden: true });
        expect(logo).toBeInTheDocument();
        expect(logo).toHaveClass("animate-spin");
    });
});
