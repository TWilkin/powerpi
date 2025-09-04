import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { vi } from "vitest";
import Header from "./Header";

vi.mock("../Logo", () => ({
    default: () => <div data-testid="logo" />,
}));

const mocks = vi.hoisted(() => ({
    useOptionalRoute: vi.fn(),
}));

vi.mock("../../routing/useOptionalRoute", () => ({ default: mocks.useOptionalRoute }));

// Mock HomeHeaderLink's useQueryFloorplan
vi.mock("../../queries/useQueryFloorPlan", () => ({
    default: () => ({
        data: {
            floors: [
                { name: "ground", display_name: "Ground Floor" },
                { name: "first", display_name: "First Floor" },
            ],
        },
    }),
}));

// Mock the click outside hook
vi.mock("../../hooks/useOnClickOutside", () => ({
    default: vi.fn(() => ({ current: null })),
}));

describe("Header", () => {
    test("renders with no optional links", () => {
        mocks.useOptionalRoute.mockReturnValue({ home: false });

        render(<Header />, { wrapper: MemoryRouter });

        const header = screen.getByRole("banner");
        expect(header).toBeInTheDocument();

        const nav = within(header).getByRole("navigation");
        expect(nav).toBeInTheDocument();

        expect(within(nav).getByTestId("logo")).toBeInTheDocument();

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

        // Check Home has submenu functionality
        expect(links[0]).toHaveAttribute("aria-haspopup", "menu");
        expect(links[0]).toHaveAttribute("aria-expanded", "false");

        // Check submenu items are rendered
        const menuItems = screen.getAllByRole("menuitem");
        expect(menuItems).toHaveLength(2);
        expect(menuItems[0]).toBeInTheDocument();
        expect(menuItems[0]).toHaveTextContent("Ground Floor");
        expect(menuItems[1]).toBeInTheDocument();
        expect(menuItems[1]).toHaveTextContent("First Floor");

        // Check menu container exists
        const menu = screen.getByRole("menu");
        expect(menu).toBeInTheDocument();
    });

    test("renders with History", () => {
        mocks.useOptionalRoute.mockReturnValue({ history: true });

        render(<Header />, { wrapper: MemoryRouter });

        const links = screen.getAllByRole("link");
        expect(links).toHaveLength(3);

        expectDevices(links[0]);
        expectHistory(links[1]);
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

    function expectHistory(link: HTMLElement) {
        expect(link).toHaveTextContent("History");
        expect(within(link).getByRole("img", { hidden: true })).toHaveAttribute(
            "data-icon",
            "clock-rotate-left",
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
