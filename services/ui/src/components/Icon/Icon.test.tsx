import { render, screen } from "@testing-library/react";
import Icon from "./Icon";
import { IconType } from "./IconLibrary";

describe("Icon", () => {
    const icons: { icon: IconType; dataIcon: string; classes?: string }[] = [
        { icon: "home", dataIcon: "house" },
        { icon: "loading", dataIcon: "spinner", classes: "animate-spin" },
        { icon: "google", dataIcon: "google" },
    ];
    test.each(icons)("renders icon $icon", ({ icon, dataIcon, classes }) => {
        render(<Icon icon={icon} />);

        const svg = screen.getByRole("img", { hidden: true });
        expect(svg).toBeInTheDocument();
        expect(svg).toHaveAttribute("data-icon", dataIcon);

        if (classes) {
            expect(svg).toHaveClass(classes);
        }
    });

    test("renders className", () => {
        render(<Icon icon="home" className="custom-class" />);

        const svg = screen.getByRole("img", { hidden: true });
        expect(svg).toBeInTheDocument();
        expect(svg).toHaveClass("custom-class");
    });
});
