import { MetricValue, Sensor } from "@powerpi/common-api";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import RoomTooltip from "./RoomTooltip";

describe("RoomTooltip", () => {
    const sensors: Sensor[] = [
        {
            name: "MySensor1",
            display_name: "My Sensor 1",
            type: "temperature",
            metrics: {
                current: MetricValue.NONE,
                humidity: MetricValue.VISIBLE,
                power: MetricValue.READ,
                temperature: MetricValue.VISIBLE,
            },
            data: {
                humidity: {
                    value: 50,
                    unit: "%",
                    since: 0,
                },
                power: {
                    value: 3,
                    unit: "W",
                    since: 0,
                },
                temperature: {
                    value: 10,
                    unit: "K",
                    since: 0,
                },
            },
            visible: true,
        },
        {
            name: "MySensor2",
            display_name: "My Sensor 2",
            type: "motion-y",
            metrics: {
                motion: MetricValue.VISIBLE,
            },
            data: {
                motion: {
                    state: "undetected",
                    since: 0,
                },
            },
            visible: true,
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

        expect(within(tooltip).getAllByRole("img", { hidden: true })).toHaveLength(
            sensors.length + 1,
        );

        expect(within(tooltip).getByText("My Sensor 1 (Humidity):")).toBeInTheDocument();
        expect(within(tooltip).getByText("My Sensor 1 (Temperature):")).toBeInTheDocument();
        expect(within(tooltip).getByText("My Sensor 2 (Motion):")).toBeInTheDocument();

        // TODO still working out how to split the data
        //expect(within(tooltip).getByText("10 K")).toBeInTheDocument();
        expect(within(tooltip).getByText("undetected")).toBeInTheDocument();

        expect(within(tooltip).getAllByRole("time")).toHaveLength(sensors.length + 1);
    });
});
