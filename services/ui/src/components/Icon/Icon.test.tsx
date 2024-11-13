import { render, screen } from "@testing-library/react";
import { ComponentProps } from "react";
import Icon from "./Icon";
import { IconType } from "./IconLibrary";

describe("Icon", () => {
    const icons: { icon: IconType; dataIcon: string; classes?: string }[] = [
        { icon: "home", dataIcon: "house" },
        { icon: "loading", dataIcon: "spinner", classes: "fa-spin" },
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

    const sizes: ComponentProps<typeof Icon>["size"][] = [undefined, "xs", "m"];
    test.each(sizes)("renders icon with size %s", (size) => {
        render(<Icon icon="device" size={size} />);

        const svg = screen.getByRole("img", { hidden: true });
        expect(svg).toBeInTheDocument();
        expect(svg).toHaveClass(`icon-${size ?? "m"}`);
    });
});
