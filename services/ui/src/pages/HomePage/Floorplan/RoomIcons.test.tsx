import { DeviceState } from "@powerpi/common-api";
import { render, screen } from "@testing-library/react";
import { vi } from "vitest";
import RoomIcons from "./RoomIcons";

const mocks = vi.hoisted(() => ({
    useQueryDevices: vi.fn(),
    userQuerySensors: vi.fn(),
}));

vi.mock("../../../queries/useQueryDevices", () => ({ default: mocks.useQueryDevices }));
vi.mock("../../../queries/useQuerySensors", () => ({ default: mocks.userQuerySensors }));

const devices = [
    createDevice("Socket1", "socket"),
    createDevice("Socket2", "socket"),
    createDevice("Light1", "light"),
    createDevice("Light2", "light"),
    createDevice("Light3", "light"),
];

const sensors = [
    createDevice("Temperature1", "temperature"),
    createDevice("Temperature2", "temperature"),
];

describe("RoomIcon", () => {
    beforeEach(() => {
        mocks.useQueryDevices.mockReturnValue({
            data: devices,
        });
        mocks.userQuerySensors.mockReturnValue({ data: sensors });
    });

    test("enough room", () => {
        const { container } = render(
            <svg>
                <RoomIcons
                    room={{
                        name: "Some Room",
                        width: 400,
                        height: 400,
                    }}
                />
            </svg>,
        );

        // there are 3 types
        expect(screen.getAllByRole("img", { hidden: true })).toHaveLength(3);

        expect(screen.getByText(/light \(3\)/)).toBeInTheDocument();
        expect(screen.getByText(/socket \(2\)/)).toBeInTheDocument();
        expect(screen.getByText(/temperature \(2\)/)).toBeInTheDocument();

        expect(container).toMatchSnapshot();
    });

    test("too small", () => {
        const { container } = render(
            <svg>
                <RoomIcons
                    room={{
                        name: "Some Room",
                        width: 190,
                        height: 130,
                    }}
                />
            </svg>,
        );

        // we should see 1 icon and the ellipsis
        const icons = screen.getAllByRole("img", { hidden: true });
        expect(icons).toHaveLength(2);

        expect(icons[0]).toHaveAttribute("data-icon", "lightbulb");
        expect(icons[1]).toHaveAttribute("data-icon", "ellipsis");

        expect(screen.getByText(/There are 2 more hidden devices\/sensors./)).toBeInTheDocument();

        expect(screen.getByText(/light \(3\)/)).toBeInTheDocument();
        expect(screen.queryByText(/socket \(2\)/)).not.toBeInTheDocument();
        expect(screen.queryByText(/temperature \(2\)/)).not.toBeInTheDocument();

        expect(container).toMatchSnapshot();
    });

    test("narrow", () => {
        const { container } = render(
            <svg>
                <RoomIcons
                    room={{
                        name: "Some Room",
                        x: 100,
                        y: 200,
                        width: 130,
                        height: 400,
                    }}
                />
            </svg>,
        );

        // there are 3 types
        expect(screen.getAllByRole("img", { hidden: true })).toHaveLength(3);

        expect(screen.getByText(/light \(3\)/)).toBeInTheDocument();
        expect(screen.getByText(/socket \(2\)/)).toBeInTheDocument();
        expect(screen.getByText(/temperature \(2\)/)).toBeInTheDocument();

        expect(container).toMatchSnapshot();
    });

    test("polygon", () => {
        const { container } = render(
            <svg>
                <RoomIcons
                    room={{
                        name: "Some Room",
                        points: [
                            { x: 0, y: 0 },
                            { x: 500, y: 0 },
                            { x: 500, y: 600 },
                            { x: 0, y: 600 },
                        ],
                    }}
                />
            </svg>,
        );

        // there are 3 types
        expect(screen.getAllByRole("img", { hidden: true })).toHaveLength(3);

        expect(screen.getByText(/light \(3\)/)).toBeInTheDocument();
        expect(screen.getByText(/socket \(2\)/)).toBeInTheDocument();
        expect(screen.getByText(/temperature \(2\)/)).toBeInTheDocument();

        expect(container).toMatchSnapshot();
    });
});

function createDevice(name: string, type: string, location: string = "Some Room", visible = true) {
    return {
        name,
        display_name: name,
        type,
        location,
        state: DeviceState.Unknown,
        since: 1,
        visible,
    };
}
