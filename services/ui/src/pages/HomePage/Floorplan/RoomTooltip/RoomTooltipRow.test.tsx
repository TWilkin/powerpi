import { Sensor } from "@powerpi/common-api";
import { render, screen } from "@testing-library/react";
import { vi } from "vitest";
import RoomTooltipRow from "./RoomTooltipRow";

describe("RoomTooltipRow", () => {
    const now = 60 * 1000 * 2;

    const sensor: Sensor = {
        name: "MySensor",
        display_name: "My Sensor",
        type: "temperature",
        visible: true,
        since: now - 60 * 1000,
        value: 10,
        unit: "K",
    };

    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(now);
    });

    afterEach(() => vi.useRealTimers());

    test("renders supported unit", () => {
        render(<RoomTooltipRow sensor={sensor} showingBattery />);

        const icon = screen.getByRole("img", { hidden: true });
        expect(icon).toBeInTheDocument();
        expect(icon).toHaveAttribute("data-icon", "temperature-half");

        expect(screen.getByText("Temperature:")).toBeInTheDocument();

        expect(screen.getByText("10 K")).toBeInTheDocument();

        const time = screen.getByRole("time");
        expect(time).toBeInTheDocument();
        expect(time).toHaveTextContent("1 minute ago");
    });

    test("renders unsupported type", () => {
        render(<RoomTooltipRow sensor={{ ...sensor, type: "banana" }} showingBattery={false} />);

        expect(screen.getByText("banana:")).toBeInTheDocument();
    });

    test("renders state", () => {
        render(
            <RoomTooltipRow
                sensor={{ ...sensor, type: "motion", value: undefined, state: "detected" }}
                showingBattery={false}
            />,
        );

        expect(screen.getByText("Motion:")).toBeInTheDocument();

        expect(screen.getByText("detected")).toBeInTheDocument();
    });

    test("renders battery", () => {
        render(<RoomTooltipRow sensor={{ ...sensor, battery: 50 }} showingBattery />);

        const icons = screen.getAllByRole("img", { hidden: true });
        expect(icons).toHaveLength(2);

        expect(icons[1]).toHaveAttribute("data-icon", "battery-half");
    });
});
