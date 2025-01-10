import { render, screen } from "@testing-library/react";
import Scrollbar from "./Scrollbar";

describe("Scrollbar component", () => {
    test("renders children correctly", () => {
        render(
            <Scrollbar>
                <div data-testid="content" />
            </Scrollbar>,
        );

        expect(screen.getByTestId("content")).toBeInTheDocument();
    });

    const cases: ["both" | "x" | "y" | undefined, boolean, boolean][] = [
        [undefined, true, true],
        ["both", true, true],
        ["x", true, false],
        ["y", false, true],
    ];
    test.each(cases)("applies the correct classes for direction $direction", (direction, x, y) => {
        render(<Scrollbar direction={direction} data-testid="scrollbar" />);

        const scrollbar = screen.getByTestId("scrollbar");
        expect(scrollbar).toBeInTheDocument();

        if (x) {
            expect(scrollbar).toHaveClass("overflow-x-auto");
        } else {
            expect(scrollbar).not.toHaveClass("overflow-x-auto");
        }

        if (y) {
            expect(scrollbar).toHaveClass("overflow-y-auto");
        } else {
            expect(scrollbar).not.toHaveClass("overflow-y-auto");
        }
    });

    test("applies additional class names", () => {
        render(<Scrollbar className="custom-class" data-testid="scrollbar" />);

        const scrollbar = screen.getByTestId("scrollbar");
        expect(scrollbar).toBeInTheDocument();
        expect(scrollbar).toHaveClass("custom-class");
    });
});
