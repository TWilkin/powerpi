import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { vi } from "vitest";
import Header from "./Header";

vi.mock("../Logo", () => ({
    default: () => <div>Logo</div>,
}));

const mocks = vi.hoisted(() => ({
    useOptionalRoute: vi.fn(),
}));

vi.mock("../../routing/useOptionalRoute", () => ({ default: mocks.useOptionalRoute }));

describe("Header", () => {
    test("renders with no optional links", () => {
        mocks.useOptionalRoute.mockReturnValue({ home: false });

        render(<Header />, { wrapper: MemoryRouter });

        const header = screen.getByRole("banner");
        expect(header).toBeInTheDocument();

        const nav = within(header).getByRole("navigation");
        expect(nav).toBeInTheDocument();

        expect(within(nav).getByText("Logo")).toBeInTheDocument();

        const links = screen.getAllByRole("link");
        expect(links).toHaveLength(2);
        expectDevices(links[0]);
        expectSettings(links[1]);
    });

    test("renders with Home", () => {
        mocks.useOptionalRoute.mockReturnValue({ home: true });

        render(<Header />, { wrapper: MemoryRouter });

        const links = screen.getAllByRole("link");
        expect(links).toHaveLength(3);

        expectHome(links[0]);
        expectDevices(links[1]);
        expectSettings(links[2]);
    });

    function expectHome(link: HTMLElement) {
        expect(link).toHaveTextContent("Home");
        expect(within(link).getByRole("img", { hidden: true })).toHaveAttribute(
            "data-icon",
            "house",
        );
    }

    function expectDevices(link: HTMLElement) {
        expect(link).toHaveTextContent("Devices");
        expect(within(link).getByRole("img", { hidden: true })).toHaveAttribute(
            "data-icon",
            "plug",
        );
    }

    function expectSettings(link: HTMLElement) {
        expect(link).toHaveTextContent("");
        expect(within(link).getByRole("img", { hidden: true })).toHaveAttribute(
            "data-icon",
            "gear",
        );
    }
});
