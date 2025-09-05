import { render, screen, within } from "@testing-library/react";
import Panel from "./Panel";

describe("Panel", () => {
    test("renders", () => {
        render(
            <Panel>
                <div data-testid="content" />
            </Panel>,
        );

        const panel = screen.getByRole("complementary");
        expect(panel).toBeInTheDocument();
        expect(panel).not.toHaveClass("max-h-[40vh]", "overflow-y-auto");

        const content = within(panel).getByTestId("content");
        expect(content).toBeInTheDocument();
    });

    test("applies scrollable classes when scrollable prop is true", () => {
        render(
            <Panel scrollable>
                <div data-testid="content" />
            </Panel>,
        );

        const panel = screen.getByRole("complementary");
        expect(panel).toBeInTheDocument();
        expect(panel).toHaveClass("max-h-[40vh]", "overflow-y-auto");
    });

    test("preserves custom className when provided", () => {
        render(
            <Panel className="custom-class" scrollable>
                <div data-testid="content" />
            </Panel>,
        );

        const panel = screen.getByRole("complementary");
        expect(panel).toBeInTheDocument();
        expect(panel).toHaveClass("custom-class", "max-h-[40vh]", "overflow-y-auto");
    });
});
