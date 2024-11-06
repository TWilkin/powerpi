import { render, screen } from "@testing-library/react";
import Button from "./Button";

describe("Button", () => {
    test("renders", () => {
        const text = "A Button";
        render(<Button>{text}</Button>);

        const button = screen.getByRole("button");
        expect(button).toBeInTheDocument();
        expect(button).toHaveTextContent(text);
    });

    test("renders with an icon", () => {
        const text = "A Button";
        render(<Button icon="home">{text}</Button>);

        const button = screen.getByRole("button");
        expect(button).toBeInTheDocument();
        expect(button).toHaveTextContent(text);

        const icon = screen.getByRole("img", { hidden: true });
        expect(icon).toBeInTheDocument();
        expect(icon).toHaveAttribute("data-icon", "house");
    });
});
