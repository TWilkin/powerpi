import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { vi } from "vitest";
import HomeHeaderLink from "./HomeHeaderLink";

const mocks = vi.hoisted(() => ({
    useQueryFloorplan: vi.fn(),
}));

vi.mock("../../queries/useQueryFloorPlan", () => ({ default: mocks.useQueryFloorplan }));

// Mock the click outside hook
vi.mock("../../hooks/useOnClickOutside", () => ({
    default: vi.fn(() => ({ current: null })),
}));

describe("HomeHeaderLink", () => {
    test("renders with no floors", () => {
        mocks.useQueryFloorplan.mockReturnValue({
            data: { floors: [] },
        });

        render(<HomeHeaderLink />, { wrapper: MemoryRouter });

        const link = screen.getByRole("link");
        expect(link).toBeInTheDocument();
        expect(link).toHaveTextContent("Home");
        expect(link).not.toHaveAttribute("aria-haspopup", "menu");
        expect(link).not.toHaveAttribute("aria-expanded", "false");

        const icon = within(link).getByRole("img", { hidden: true });
        expect(icon).toBeInTheDocument();
        expect(icon).toHaveAttribute("data-icon", "house");

        // No submenu items should be rendered
        expect(screen.queryAllByRole("menuitem")).toHaveLength(0);
    });

    test("renders with single floor using name", () => {
        mocks.useQueryFloorplan.mockReturnValue({
            data: {
                floors: [{ name: "ground" }],
            },
        });

        render(<HomeHeaderLink />, { wrapper: MemoryRouter });

        const link = screen.getByRole("link");
        expect(link).toBeInTheDocument();
        expect(link).toHaveTextContent("Home");

        const subLinks = screen.queryAllByRole("menuitem");
        expect(subLinks).toHaveLength(0);
    });

    test("renders with multiple floors", () => {
        mocks.useQueryFloorplan.mockReturnValue({
            data: {
                floors: [
                    { name: "ground", display_name: "Ground Floor" },
                    { name: "first", display_name: "First Floor" },
                ],
            },
        });

        render(<HomeHeaderLink />, { wrapper: MemoryRouter });

        const link = screen.getByRole("link");
        expect(link).toBeInTheDocument();
        expect(link).toHaveTextContent("Home");
        expect(link).toHaveAttribute("aria-haspopup", "menu");
        expect(link).toHaveAttribute("aria-expanded", "false");

        const subLinks = screen.getAllByRole("menuitem");
        expect(subLinks).toHaveLength(2);

        expect(subLinks[0]).toBeInTheDocument();
        expect(subLinks[0]).toHaveTextContent("Ground Floor");

        expect(subLinks[1]).toBeInTheDocument();
        expect(subLinks[1]).toHaveTextContent("First Floor");
    });
});
