import { Sensor } from "@powerpi/api";
import { render, screen } from "@testing-library/react";
import BatteryIcon from "./BatteryIcon";

test("No Sensor", () => {
    render(<BatteryIcon sensor={{ battery: undefined, batterySince: undefined } as Sensor} />);

    expect(screen.queryByRole("img", { hidden: true })).toBeNull();
});

[
    [100, "full"],
    [76, "full"],
    [75, "three-quarter"],
    [51, "three-quarter"],
    [50, "half"],
    [26, "half"],
    [25, "quarter", "warning"],
    [11, "quarter", "warning"],
    [10, "quarter", "low"],
    [6, "quarter", "low"],
    [5, "empty", "low"],
    [0, "empty", "low"],
].forEach((values) => {
    const [percentage, icon, className] = values;

    test(`${percentage}%`, () => {
        render(
            <BatteryIcon
                sensor={{ battery: percentage, batterySince: new Date().getTime() } as Sensor}
                className="test"
            />
        );

        const svg = screen.getByRole("img", { hidden: true });
        expect(svg.classList.contains(icon as string)).toBeTruthy();

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
