import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import Route from "../../routing/Route";
import HeaderLink from "./HeaderLink";

describe("HeaderLink", () => {
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
});
