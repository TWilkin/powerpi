import { render, screen } from "@testing-library/react";
import Icon from "./Icon";
import { IconType } from "./IconLibrary";

describe("Icon", () => {
    const icons: { icon: IconType; dataIcon: string }[] = [
        { icon: "home", dataIcon: "house" },
        { icon: "loading", dataIcon: "spinner" },
    ];
    test.each(icons)("renders icon $icon", ({ icon, dataIcon }) => {
        render(<Icon icon={icon} />);

        const svg = screen.getByRole("img", { hidden: true });
        expect(svg).toBeInTheDocument();
        expect(svg).toHaveAttribute("data-icon", dataIcon);
    });
});
