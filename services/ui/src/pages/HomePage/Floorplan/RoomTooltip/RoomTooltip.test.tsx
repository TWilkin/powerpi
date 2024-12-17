import { Sensor } from "@powerpi/common-api";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import RoomTooltip from "./RoomTooltip";

describe("RoomTooltip", () => {
    const sensors: Sensor[] = [
        {
            name: "MySensor1",
            display_name: "My Sensor 1",
            type: "temperature",
            visible: true,
            since: 0,
            value: 10,
            unit: "K",
        },
        {
            name: "MySensor2",
            display_name: "My Sensor 2",
            type: "motion-y",
            visible: true,
            since: 0,
            state: "undetected",
        },
    ];

    test("renders", async () => {
        render(
            <>
                <div data-tooltip-id="room-tooltip-Ground-MasterBedroom" data-testid="hover" />
                <RoomTooltip
                    name="Master Bedroom"
                    floor="Ground"
                    room="MasterBedroom"
                    sensors={sensors}
                />
            </>,
        );

        const hover = screen.getByTestId("hover");
        expect(hover).toBeInTheDocument();

        await userEvent.hover(hover);

        const tooltip = screen.getByRole("tooltip");
        expect(tooltip).toBeInTheDocument();

        expect(
            within(tooltip).getByRole("heading", { name: "Master Bedroom" }),
        ).toBeInTheDocument();

        expect(within(tooltip).getAllByRole("img", { hidden: true })).toHaveLength(sensors.length);

        expect(within(tooltip).getByText("Temperature:")).toBeInTheDocument();
        expect(within(tooltip).getByText("motion-y:")).toBeInTheDocument();

        expect(within(tooltip).getByText("10 K")).toBeInTheDocument();
        expect(within(tooltip).getByText("undetected")).toBeInTheDocument();

        expect(within(tooltip).getAllByRole("time")).toHaveLength(sensors.length);
    });
});
