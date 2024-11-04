import { faHome } from "@fortawesome/free-solid-svg-icons";
import "@testing-library/jest-dom";
import "@testing-library/jest-dom/vitest";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, test } from "vitest";
import Route from "../../routing/Route";
import HeaderLink from "./HeaderLink";

describe("HeaderLink", () =>
    test("renders", () => {
        render(<HeaderLink route={Route.Home} icon={faHome} text="Home" />, {
            wrapper: MemoryRouter,
        });

        const link = screen.getByRole("link");
        expect(link).toBeInTheDocument();

        const icon = within(link).getByRole("img", { hidden: true });
        expect(icon).toBeInTheDocument();
        expect(icon).toHaveAttribute("data-icon", "house");

        expect(within(link).getByText("Home")).toBeInTheDocument();
    }));
