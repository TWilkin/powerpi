import { render, screen } from "@testing-library/react";
import Button from "./Button";

describe("Button", () =>
    test("renders", () => {
        const text = "A Button";
        render(<Button>{text}</Button>);

        const button = screen.getByRole("button");
        expect(button).toBeInTheDocument();
        expect(button).toHaveTextContent(text);
    }));
