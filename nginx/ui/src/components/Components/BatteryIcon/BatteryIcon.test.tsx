import { Sensor } from "@powerpi/api";
import { render, screen } from "@testing-library/react";
import BatteryIcon from "./BatteryIcon";

test("No Sensor", () => {
    render(<BatteryIcon sensor={{ battery: undefined, batterySince: undefined } as Sensor} />);

    expect(screen.queryByRole("img", { hidden: true })).toBeNull();
});

[
    [100, "battery-full"],
    [76, "battery-full"],
    [75, "battery-three-quarters"],
    [51, "battery-three-quarters"],
    [50, "battery-half"],
    [26, "battery-half"],
    [25, "battery-quarter", "warning"],
    [11, "battery-quarter", "warning"],
    [10, "battery-quarter", "low"],
    [6, "battery-quarter", "low"],
    [5, "battery-empty", "low"],
    [0, "battery-empty", "low"],
].forEach((values) => {
    const [percentage, icon, className] = values;

    test(`${percentage}%`, () => {
        render(
            <BatteryIcon
                sensor={{ battery: percentage, batterySince: new Date().getTime() } as Sensor}
            />
        );

        const svg = screen.getByRole("img", { hidden: true });
        expect(svg).toHaveAttribute("data-icon", icon);

        if (className) {
            expect(svg.classList.contains(className as string)).toBeTruthy();
        }
    });
});

[
    [0, false],
    [-1, false],
    [-7, true],
    [-8, true],
].forEach((values) => {
    const [offset, hasClass] = values;
    const date = new Date();
    date.setDate(date.getDate() + (offset as number));

    test(`${date} last battery update`, () => {
        render(<BatteryIcon sensor={{ battery: 100, batterySince: date.getTime() } as Sensor} />);

        const svg = screen.getByRole("img", { hidden: true });
        expect(svg.classList.contains("outdated")).toBe(hasClass);
    });
});
