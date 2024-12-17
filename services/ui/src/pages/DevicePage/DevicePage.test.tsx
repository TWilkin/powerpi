import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ComponentProps } from "react";
import { vi } from "vitest";
import DeviceFilter from "./DeviceFilter";
import DevicePage from "./DevicePage";

const mocks = vi.hoisted(() => ({
    useDeviceFilter: vi.fn(),
}));

vi.mock("./useDeviceFilter", () => ({ default: mocks.useDeviceFilter }));

vi.mock("./DeviceFilter", () => ({
    default: ({ open }: ComponentProps<typeof DeviceFilter>) => (
        <div data-testid="filter">{open ? "open" : "closed"}</div>
    ),
}));

vi.mock("../../components/Capabilities/CapabilityButton", () => ({
    default: () => <div data-testid="capability-button" />,
}));
vi.mock("../../components/DevicePowerToggle", () => ({
    default: () => <div data-testid="device-power-toggle" />,
}));

describe("DevicePage", () => {
    const defaultFilter = {
        state: {},
        devices: [],
        types: [],
        locations: [],
        total: 0,
        dispatch: vi.fn(),
        clear: vi.fn(),
    };

    test("renders", () => {
        mocks.useDeviceFilter.mockReturnValue({
            ...defaultFilter,
            devices: [
                {
                    name: "device1",
                    display_name: "Device 1",
                    type: "light",
                    since: 0,
                    visible: true,
                },
                {
                    name: "device2",
                    type: "socket",
                    since: 0,
                    visible: true,
                },
            ],
            total: 2,
        });

        render(<DevicePage />);

        expect(screen.getByRole("button", { name: "Open filters" })).toBeInTheDocument();
        expect(screen.getByRole("searchbox")).toBeInTheDocument();

        const filter = screen.getByTestId("filter");
        expect(filter).toBeInTheDocument();
        expect(filter).toHaveTextContent("closed");

        const table = screen.getByRole("table");
        expect(table).toBeInTheDocument();

        const rows = within(table).getAllByRole("row");
        expect(rows).toHaveLength(2);

        expect(within(rows[0]).getByText("Device 1")).toBeInTheDocument();
        expect(within(rows[0]).getByRole("time")).toBeInTheDocument();

        expect(within(rows[1]).getByText("device2")).toBeInTheDocument();
        expect(within(rows[1]).getByRole("time")).toBeInTheDocument();
    });

    test("empty", () => {
        mocks.useDeviceFilter.mockReturnValue(defaultFilter);

        render(<DevicePage />);

        expect(screen.getByText("No devices.")).toBeInTheDocument();
    });

    const filtered: [number, string][] = [
        [1, "Filtered 1 device."],
        [2, "Filtered 2 devices."],
        [1_234, "Filtered 1,234 devices."],
    ];
    test.each(filtered)("filtered %i", (total, expected) => {
        mocks.useDeviceFilter.mockReturnValue({
            ...defaultFilter,
            total,
        });

        render(<DevicePage />);

        expect(screen.getByText(expected)).toBeInTheDocument();
    });

    test("searches", async () => {
        const dispatch = vi.fn();
        mocks.useDeviceFilter.mockReturnValue({ ...defaultFilter, dispatch });

        render(<DevicePage />);

        const search = screen.getByRole("searchbox");
        expect(search).toBeInTheDocument();

        await userEvent.type(search, "ab");

        expect(dispatch).toHaveBeenCalledTimes(2);
        expect(dispatch).toHaveBeenNthCalledWith(1, { type: "Search", search: "a" });
        expect(dispatch).toHaveBeenNthCalledWith(2, { type: "Search", search: "ab" });
    });

    test("opens filter", async () => {
        render(<DevicePage />);

        const button = screen.getByRole("button", { name: "Open filters" });
        expect(button).toBeInTheDocument();

        const filter = screen.getByTestId("filter");
        expect(filter).toBeInTheDocument();
        expect(filter).toHaveTextContent("closed");

        await userEvent.click(button);

        expect(filter).toHaveTextContent("open");
    });

    test("invisible", () => {
        mocks.useDeviceFilter.mockReturnValue({
            ...defaultFilter,
            devices: [
                {
                    name: "device1",
                    display_name: "Device 1",
                    type: "light",
                    since: 0,
                    visible: true,
                },
                {
                    name: "device2",
                    type: "socket",
                    since: 0,
                    visible: false,
                },
            ],
            total: 2,
        });

        render(<DevicePage />);

        const rows = screen.getAllByRole("row");
        expect(rows).toHaveLength(2);

        expect(within(rows[0]).getByText("Device 1")).toBeInTheDocument();
        let cells = within(rows[0]).getAllByRole("cell");
        expect(cells).toHaveLength(5);
        let icon = within(cells[0]).getByRole("img", { hidden: true });
        expect(icon).toBeInTheDocument();
        expect(icon).toHaveAttribute("data-icon", "eye");

        expect(within(rows[1]).getByText("device2")).toBeInTheDocument();
        cells = within(rows[1]).getAllByRole("cell");
        expect(cells).toHaveLength(5);
        icon = within(cells[0]).getByRole("img", { hidden: true });
        expect(icon).toBeInTheDocument();
        expect(icon).toHaveAttribute("data-icon", "eye-slash");
    });

    test("battery", () => {
        mocks.useDeviceFilter.mockReturnValue({
            ...defaultFilter,
            devices: [
                {
                    name: "device1",
                    display_name: "Device 1",
                    type: "light",
                    since: 0,
                    visible: true,
                },
                {
                    name: "device2",
                    type: "socket",
                    since: 0,
                    visible: true,
                    battery: 50,
                    batterySince: 10,
                },
            ],
            total: 2,
        });

        render(<DevicePage />);

        const rows = screen.getAllByRole("row");
        expect(rows).toHaveLength(2);

        expect(within(rows[0]).getByText("Device 1")).toBeInTheDocument();
        let cells = within(rows[0]).getAllByRole("cell");
        expect(cells).toHaveLength(5);
        expect(within(cells[1]).queryByRole("img", { hidden: true })).not.toBeInTheDocument();

        expect(within(rows[1]).getByText("device2")).toBeInTheDocument();
        cells = within(rows[1]).getAllByRole("cell");
        expect(cells).toHaveLength(5);
        const icon = within(cells[1]).getByRole("img", { hidden: true });
        expect(icon).toBeInTheDocument();
        expect(icon).toHaveAttribute("data-icon", "battery-half");
    });
});
