import { act, fireEvent, render, screen } from "@testing-library/react";
import { vi } from "vitest";
import Slider from "./Slider";

describe("Slider", () => {
    beforeAll(() => (HTMLCanvasElement.prototype.getContext = vi.fn()));

    test("renders", () => {
        render(
            <Slider
                lowIcon="capability"
                highIcon="deviceLight"
                label="Brightness"
                min={1}
                max={100}
                defaultValue={50}
                value={50}
                unit="percentage"
                onChange={vi.fn()}
                onSettled={vi.fn()}
            />,
        );

        const slider = screen.getByRole("slider");
        expect(slider).toBeInTheDocument();
        expect(slider).toHaveAccessibleName("Brightness");
        expect(slider).not.toBeDisabled();

        expect(screen.getByText("1%")).toBeInTheDocument();
        expect(screen.getByText("50%")).toBeInTheDocument();
        expect(screen.getByText("100%")).toBeInTheDocument();

        const icons = screen.getAllByRole("img", { hidden: true });
        expect(icons).toHaveLength(2);
        expect(icons[0]).toHaveAttribute("data-icon", "gear");
        expect(icons[1]).toHaveAttribute("data-icon", "lightbulb");
    });

    test("disables", () => {
        render(
            <Slider
                lowIcon="capability"
                highIcon="deviceLight"
                label="Brightness"
                min={1}
                max={100}
                defaultValue={50}
                value={50}
                unit="percentage"
                disabled
                onChange={vi.fn()}
                onSettled={vi.fn()}
            />,
        );

        const slider = screen.getByRole("slider");
        expect(slider).toBeInTheDocument();
        expect(slider).toBeDisabled();
    });

    test("handles change", async () => {
        const onChange = vi.fn();
        const onSettled = vi.fn();

        render(
            <Slider
                lowIcon="capability"
                highIcon="deviceLight"
                label="Brightness"
                min={1}
                max={100}
                defaultValue={50}
                value={50}
                unit="percentage"
                onChange={onChange}
                onSettled={onSettled}
            />,
        );

        const slider = screen.getByRole("slider");
        expect(slider).toBeInTheDocument();

        act(() => fireEvent.change(slider, { target: { value: 60 } }));

        expect(onChange).toHaveBeenCalledTimes(1);
        expect(onChange).toHaveBeenCalledWith(60);

        expect(onSettled).not.toHaveBeenCalled();
    });
});
