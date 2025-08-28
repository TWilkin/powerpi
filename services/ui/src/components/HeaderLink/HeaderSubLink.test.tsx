import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { vi } from "vitest";
import Route from "../../routing/Route";
import HeaderSubLink from "./HeaderSubLink";
import HeaderSubMenuContext, { HeaderSubMenuContextType } from "./HeaderSubMenuContext";

describe("HeaderSubLink", () => {
    const mockContext: HeaderSubMenuContextType = {
        subMenuId: "test-submenu",
        activeSubMenuIndex: 0,
        registerSubMenuLink: vi.fn(() => 0),
        closeSubMenu: vi.fn(),
        focusNext: vi.fn(),
        focusPrevious: vi.fn(),
        focusFirst: vi.fn(),
        focusLast: vi.fn(),
    };

    test("renders with correct accessibility attributes", () => {
        render(
            <HeaderSubMenuContext.Provider value={mockContext}>
                <HeaderSubLink route={Route.Device} icon="device" text="Devices" />
            </HeaderSubMenuContext.Provider>,
            { wrapper: MemoryRouter },
        );

        const menuItem = screen.getByRole("menuitem");
        expect(menuItem).toBeInTheDocument();
        expect(menuItem).toHaveTextContent("Devices");
        expect(menuItem).toHaveAttribute("aria-controls", "test-submenu");
        expect(menuItem).toHaveAttribute("tabIndex", "-1"); // Initially inactive
    });

    test("updates tabIndex when activeSubMenuIndex changes", () => {
        const { rerender } = render(
            <HeaderSubMenuContext.Provider value={mockContext}>
                <HeaderSubLink route={Route.Device} icon="device" text="Devices" />
            </HeaderSubMenuContext.Provider>,
            { wrapper: MemoryRouter },
        );

        const menuItem = screen.getByRole("menuitem");
        expect(menuItem).toBeInTheDocument();
        expect(menuItem).toHaveAttribute("tabIndex", "-1"); // Initially

        expect(mockContext.registerSubMenuLink).toHaveBeenCalled();

        const updatedContext = { ...mockContext, activeSubMenuIndex: 0 };
        rerender(
            <HeaderSubMenuContext.Provider value={updatedContext}>
                <HeaderSubLink route={Route.Device} icon="device" text="Devices" />
            </HeaderSubMenuContext.Provider>,
        );

        expect(menuItem).toHaveAttribute("tabIndex", "0"); // After context update
    });

    test("renders inactive item with correct tabIndex", () => {
        const inactiveContext = { ...mockContext, activeSubMenuIndex: 1 };

        render(
            <HeaderSubMenuContext.Provider value={inactiveContext}>
                <HeaderSubLink route={Route.Device} icon="device" text="Devices" />
            </HeaderSubMenuContext.Provider>,
            { wrapper: MemoryRouter },
        );

        const menuItem = screen.getByRole("menuitem");
        expect(menuItem).toBeInTheDocument();
        expect(menuItem).toHaveAttribute("tabIndex", "-1"); // Inactive item
    });
});
