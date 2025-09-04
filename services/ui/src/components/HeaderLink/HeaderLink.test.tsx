import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { vi } from "vitest";
import Route from "../../routing/Route";
import HeaderLink from "./HeaderLink";
import HeaderSubLink from "./HeaderSubLink";

// Mock the click outside hook
vi.mock("../../hooks/useOnClickOutside", () => ({
    default: vi.fn(() => ({ current: null })),
}));

describe("HeaderLink", () => {
    const user = userEvent.setup();

    test("renders", () => {
        render(<HeaderLink route={Route.Home} icon="home" text="Home" />, {
            wrapper: MemoryRouter,
        });

        const link = screen.getByRole("link");
        expect(link).toBeInTheDocument();
        expect(link).toHaveTextContent("Home");

        const icon = within(link).getByRole("img", { hidden: true });
        expect(icon).toBeInTheDocument();
        expect(icon).toHaveAttribute("data-icon", "house");
    });

    test("small", () => {
        render(<HeaderLink route={Route.Settings} icon="settings" text="Settings" small />, {
            wrapper: MemoryRouter,
        });

        const link = screen.getByRole("link");
        expect(link).toBeInTheDocument();
        expect(link).toHaveTextContent("");
        expect(link).toHaveAccessibleName("Settings");

        const icon = within(link).getByRole("img", { hidden: true });
        expect(icon).toBeInTheDocument();
        expect(icon).toHaveAttribute("data-icon", "gear");
    });

    test("renders without submenu", () => {
        render(<HeaderLink route={Route.Home} icon="home" text="Home" />, {
            wrapper: MemoryRouter,
        });

        const link = screen.getByRole("link");
        expect(link).toBeInTheDocument();
        expect(link).not.toHaveAttribute("aria-haspopup");
        expect(link).not.toHaveAttribute("aria-expanded");
        expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    });

    describe("with submenu", () => {
        beforeEach(() => {
            // Mock touch device detection
            Object.defineProperty(window, "matchMedia", {
                writable: true,
                value: vi.fn().mockImplementation((query) => ({
                    matches: query === "(hover: none)",
                    media: query,
                    onchange: null,
                    addEventListener: vi.fn(),
                    removeEventListener: vi.fn(),
                    dispatchEvent: vi.fn(),
                })),
            });
        });

        test("renders with submenu accessibility attributes", () => {
            render(
                <HeaderLink route={Route.Home} icon="home" text="Home">
                    <HeaderSubLink route={Route.Device} icon="device" text="Devices" />
                </HeaderLink>,
                { wrapper: MemoryRouter },
            );

            const link = screen.getByRole("link");
            expect(link).toBeInTheDocument();
            expect(link).toHaveAttribute("aria-haspopup", "menu");
            expect(link).toHaveAttribute("aria-expanded", "false");
        });

        test("opens submenu on keyboard activation", async () => {
            render(
                <HeaderLink route={Route.Home} icon="home" text="Home">
                    <HeaderSubLink route={Route.Device} icon="device" text="Devices" />
                </HeaderLink>,
                { wrapper: MemoryRouter },
            );

            const trigger = screen.getByRole("link");
            expect(trigger).toBeInTheDocument();
            trigger.focus();

            await user.keyboard("{Enter}");
            expect(trigger).toHaveAttribute("aria-expanded", "true");

            const menu = screen.getByRole("menu");
            expect(menu).toBeInTheDocument();

            const sublink = screen.getByRole("menuitem");
            expect(sublink).toBeInTheDocument();
            expect(sublink).toHaveTextContent("Devices");
        });

        test("supports arrow key navigation in submenu", async () => {
            render(
                <HeaderLink route={Route.Home} icon="home" text="Home">
                    <HeaderSubLink route={Route.Device} icon="device" text="Devices" />
                    <HeaderSubLink route={Route.Settings} icon="settings" text="Settings" />
                </HeaderLink>,
                { wrapper: MemoryRouter },
            );

            const trigger = screen.getByRole("link");
            expect(trigger).toBeInTheDocument();
            trigger.focus();
            await user.keyboard("{ArrowDown}");

            const menuItems = screen.getAllByRole("menuitem");
            expect(menuItems[0]).toBeInTheDocument();
            expect(menuItems[0]).toHaveFocus();

            await user.keyboard("{ArrowDown}");
            expect(menuItems[1]).toHaveFocus();

            await user.keyboard("{ArrowUp}");
            expect(menuItems[0]).toHaveFocus();
        });

        test("closes submenu with escape key", async () => {
            render(
                <HeaderLink route={Route.Home} icon="home" text="Home">
                    <HeaderSubLink route={Route.Device} icon="device" text="Devices" />
                </HeaderLink>,
                { wrapper: MemoryRouter },
            );

            const trigger = screen.getByRole("link");
            expect(trigger).toBeInTheDocument();
            trigger.focus();
            await user.keyboard("{Enter}");

            const menu = screen.getByRole("menu");
            expect(menu).toBeInTheDocument();
            expect(menu).not.toHaveClass("hidden");

            const sublink = screen.getByRole("menuitem");
            expect(sublink).toBeInTheDocument();
            await user.keyboard("{Escape}");

            expect(menu).toHaveClass("hidden");
            expect(trigger).toHaveFocus();
        });

        test("supports home/end keys", async () => {
            render(
                <HeaderLink route={Route.Home} icon="home" text="Home">
                    <HeaderSubLink route={Route.Device} icon="device" text="Devices" />
                    <HeaderSubLink route={Route.History} icon="history" text="History" />
                    <HeaderSubLink route={Route.Settings} icon="settings" text="Settings" />
                </HeaderLink>,
                { wrapper: MemoryRouter },
            );

            const trigger = screen.getByRole("link");
            expect(trigger).toBeInTheDocument();
            trigger.focus();
            await user.keyboard("{Enter}");

            const menuItems = screen.getAllByRole("menuitem");
            expect(menuItems[0]).toBeInTheDocument();
            expect(menuItems[2]).toBeInTheDocument();

            await user.keyboard("{End}");
            expect(menuItems[2]).toHaveFocus();

            await user.keyboard("{Home}");
            expect(menuItems[0]).toHaveFocus();
        });
    });
});
