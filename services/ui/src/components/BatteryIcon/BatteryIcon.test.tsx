import { act, render, screen } from "@testing-library/react";
import { describe, test, vi } from "vitest";
import BatteryIcon from "./BatteryIcon";

describe("BatteryIcon", () => {
    beforeAll(() => vi.useFakeTimers());
    afterAll(() => vi.useRealTimers);

    test("no battery level", () => {
        render(<BatteryIcon device={{ battery: undefined, batterySince: undefined }} />);

        expect(screen.queryByRole("img", { hidden: true })).not.toBeInTheDocument();
    });

    test("outdated", () => {
        render(<BatteryIcon device={{ battery: 100, batterySince: 10 }} />);

        const batteryIcon = screen.getByRole("img", { hidden: true });
        expect(batteryIcon).toBeInTheDocument();
        expect(batteryIcon).toHaveClass("opacity-50");
    });

    const levels: { battery: number; icon: string; warning?: boolean; critical?: boolean }[] = [
        { battery: 100, icon: "battery-full" },
        { battery: 76, icon: "battery-full" },
        { battery: 75, icon: "battery-three-quarters" },
        { battery: 51, icon: "battery-three-quarters" },
        { battery: 50, icon: "battery-half" },
        { battery: 26, icon: "battery-half" },
        { battery: 25, icon: "battery-quarter", warning: true },
        { battery: 11, icon: "battery-quarter", warning: true },
        { battery: 10, icon: "battery-quarter", critical: true },
        { battery: 6, icon: "battery-quarter", critical: true },
        { battery: 5, icon: "battery-empty", critical: true },
        { battery: 0, icon: "battery-empty", critical: true },
    ];
    test.each(levels)("battery level $battery percent", ({ battery, icon, warning, critical }) => {
        render(<BatteryIcon device={{ battery, batterySince: new Date().getTime() }} />);

        const batteryIcon = screen.getByRole("img", { hidden: true });
        expect(batteryIcon).toBeInTheDocument();
        expect(batteryIcon).toHaveAttribute("data-icon", icon);
        expect(batteryIcon).not.toHaveClass("opacity-50");

        if (warning) {
            expect(batteryIcon).toHaveClass("text-orange-600");
        } else {
            expect(batteryIcon).not.toHaveClass("text-orange-600");
        }

        if (critical) {
            expect(batteryIcon).toHaveClass("text-red-600");
        } else {
            expect(batteryIcon).not.toHaveClass("text-red-600");
        }
    });

    const animationStates: { battery: number; icons: string[] }[] = [
        {
            battery: 100,
            icons: [
                "battery-full",
                "battery-three-quarters",
                "battery-full",
                "battery-three-quarters",
            ],
        },
        {
            battery: 75,
            icons: ["battery-three-quarters", "battery-full", "battery-three-quarters"],
        },
        {
            battery: 50,
            icons: ["battery-half", "battery-three-quarters", "battery-full", "battery-half"],
        },
        {
            battery: 25,
            icons: [
                "battery-quarter",
                "battery-half",
                "battery-three-quarters",
                "battery-full",
                "battery-quarter",
            ],
        },
        {
            battery: 0,
            icons: [
                "battery-empty",
                "battery-quarter",
                "battery-half",
                "battery-three-quarters",
                "battery-full",
                "battery-empty",
            ],
        },
    ];
    test.each(animationStates)("charging level $battery percent", ({ battery, icons }) => {
        render(
            <BatteryIcon
                device={{ battery, charging: true, batterySince: new Date().getTime() }}
            />,
        );

        const batteryIcon = screen.getByRole("img", { hidden: true });
        expect(batteryIcon).toBeInTheDocument();

        for (const icon of icons) {
            console.log(icon);
            expect(batteryIcon).toHaveAttribute("data-icon", icon);

            act(() => vi.advanceTimersByTime(1000));
        }
    });
});
