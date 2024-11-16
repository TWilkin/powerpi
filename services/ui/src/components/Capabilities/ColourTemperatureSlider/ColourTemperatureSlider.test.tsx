import { Device, DeviceState } from "@powerpi/common-api";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { vi } from "vitest";
import ColourTemperatureSlider from "./ColourTemperatureSlider";

describe("ColourTemperatureSlider", () => {
    const device: Device = {
        name: "MyDevice",
        state: DeviceState.On,
        since: 0,
        display_name: "My Device",
        visible: true,
        type: "light",
    };

    const range = {
        min: 1500,
        max: 9000,
    };

    beforeAll(() => (HTMLCanvasElement.prototype.getContext = vi.fn()));

    test("renders", () => {
        render(
            <ColourTemperatureSlider
                device={device}
                range={range}
                disabled={false}
                mutateAsync={vi.fn()}
            />,
        );

        const slider = screen.getByRole("slider");
        expect(slider).toBeInTheDocument();
        expect(slider).toHaveAccessibleName("Set colour temperature for My Device");
        expect(slider).not.toBeDisabled();
        expect(slider).toHaveValue("1500");

        const icons = screen.getAllByRole("img", { hidden: true });
        expect(icons).toHaveLength(2);
        expect(icons[0]).toHaveAttribute("data-icon", "temperature-empty");
        expect(icons[1]).toHaveAttribute("data-icon", "temperature-full");
    });

    test("disables", () => {
        render(
            <ColourTemperatureSlider
                device={device}
                range={range}
                disabled
                mutateAsync={vi.fn()}
            />,
        );

        const slider = screen.getByRole("slider");
        expect(slider).toBeInTheDocument();
        expect(slider).toBeDisabled();
    });

    test("handles change", () => {
        render(
            <ColourTemperatureSlider
                device={{ ...device, additionalState: { temperature: 5000 } }}
                range={range}
                disabled
                mutateAsync={vi.fn()}
            />,
        );

        const slider = screen.getByRole("slider");
        expect(slider).toBeInTheDocument();
        expect(slider).toHaveValue("5000");

        act(() => fireEvent.change(slider, { target: { value: 6000 } }));

        expect(slider).toHaveValue("6000");
    });
});
