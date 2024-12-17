import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ComponentProps } from "react";
import { Tooltip } from "react-tooltip";
import useTooltip from "./useTooltip";

const TestComponent = ({
    className,
    ...options
}: Parameters<typeof useTooltip>[0] & Pick<ComponentProps<typeof Tooltip>, "className">) => {
    const { tooltipProps, componentProps } = useTooltip(options);

    return (
        <>
            <div {...componentProps} data-testid="hover" />
            <Tooltip {...tooltipProps} className={className}>
                Tooltip
            </Tooltip>
        </>
    );
};

describe("Tooltip", () => {
    test("renders", async () => {
        render(<TestComponent />);

        expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();

        const hover = screen.getByTestId("hover");
        expect(hover).toBeInTheDocument();

        await userEvent.hover(hover);

        const tooltip = screen.getByRole("tooltip");
        expect(tooltip).toBeInTheDocument();
        expect(tooltip).toHaveTextContent("Tooltip");
    });

    test("with place", async () => {
        render(<TestComponent place="left" />);

        const hover = screen.getByTestId("hover");
        expect(hover).toBeInTheDocument();

        await userEvent.hover(hover);

        const tooltip = screen.getByRole("tooltip");
        expect(tooltip).toBeInTheDocument();
        expect(tooltip).toHaveClass("react-tooltip__place-left");
    });

    test("with className", async () => {
        render(<TestComponent className="something" />);

        const hover = screen.getByTestId("hover");
        expect(hover).toBeInTheDocument();

        await userEvent.hover(hover);

        const tooltip = screen.getByRole("tooltip");
        expect(tooltip).toBeInTheDocument();
        expect(tooltip).toHaveClass("something");
    });
});
