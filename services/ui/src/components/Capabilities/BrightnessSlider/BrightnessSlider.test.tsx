import { Device, DeviceState } from "@powerpi/common-api";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { vi } from "vitest";
import BrightnessSlider from "./BrightnessSlider";

describe("BrightnessSlider", () => {
    const device: Device = {
        name: "MyDevice",
        state: DeviceState.On,
        since: 0,
        display_name: "My Device",
        visible: true,
        type: "light",
    };

    test("renders", () => {
        render(<BrightnessSlider device={device} disabled={false} mutateAsync={vi.fn()} />);

        const slider = screen.getByRole("slider");
        expect(slider).toBeInTheDocument();
        expect(slider).toHaveAccessibleName("Set brightness for My Device");
        expect(slider).not.toBeDisabled();
        expect(slider).toHaveValue("0");

        const icons = screen.getAllByRole("img", { hidden: true });
        expect(icons).toHaveLength(2);
        expect(icons[0]).toHaveAttribute("data-icon", "moon");
        expect(icons[1]).toHaveAttribute("data-icon", "sun");
    });

    test("disables", () => {
        render(<BrightnessSlider device={device} disabled mutateAsync={vi.fn()} />);

        const slider = screen.getByRole("slider");
        expect(slider).toBeInTheDocument();
        expect(slider).toBeDisabled();
    });

    test("handles change", () => {
        render(
            <BrightnessSlider
                device={{ ...device, additionalState: { brightness: 50 } }}
                disabled
                mutateAsync={vi.fn()}
            />,
        );

        const slider = screen.getByRole("slider");
        expect(slider).toBeInTheDocument();
        expect(slider).toHaveValue("50");

        act(() => fireEvent.change(slider, { target: { value: 60 } }));

        expect(slider).toHaveValue("60");
    });
});
