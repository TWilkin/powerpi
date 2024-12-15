import { DeviceState, Floorplan as IFloorplan } from "@powerpi/common-api";
import { render } from "@testing-library/react";
import { vi } from "vitest";
import Floorplan from "./Floorplan";

const mocks = vi.hoisted(() => ({
    useOrientation: vi.fn(),
    useQueryDevices: vi.fn(),
    useQuerySensors: vi.fn(),
    useFloor: vi.fn(),
}));

vi.mock("../../../hooks/useOrientation", () => ({ default: mocks.useOrientation }));
vi.mock("../../../queries/useQueryDevices", () => ({ default: mocks.useQueryDevices }));
vi.mock("../../../queries/useQuerySensors", () => ({ default: mocks.useQuerySensors }));
vi.mock("../useFloor", () => ({ default: mocks.useFloor }));

const devices = [
    createDevice("Socket1", "socket", "LivingRoom"),
    createDevice("Socket2", "socket", "LivingRoom"),
    createDevice("Light1", "light", "LivingRoom"),
    createDevice("Light2", "light", "MasterBedroom"),
    createDevice("Light3", "light"),
];

const sensors = [
    createDevice("Temperature1", "temperature", "LivingRoom"),
    createDevice("Temperature2", "temperature", "MasterBedroom"),
];

describe("Floorplan", () => {
    const floorplan: IFloorplan = {
        floors: [
            {
                name: "Ground",
                rooms: [
                    {
                        name: "LivingRoom",
                        display_name: "Living Room",
                        width: 100,
                        height: 100,
                    },
                    { name: "Kitchen", width: 100, height: 100, x: 100 },
                ],
            },
            {
                name: "First",
                rooms: [
                    {
                        name: "MasterBedroom",
                        display_name: "Master Bedroom",
                        width: 200,
                        height: 100,
                    },
                ],
            },
        ],
    };

    beforeEach(() => {
        mocks.useOrientation.mockReturnValue({ isLandscape: true, isPortrait: false });
        mocks.useQueryDevices.mockReturnValue({
            data: devices,
        });
        mocks.useQuerySensors.mockReturnValue({ data: sensors });

        mocks.useFloor.mockReturnValue("Ground");
    });

    test("renders ground floor", () => {
        mocks.useFloor.mockReturnValue("Ground");

        const { container } = render(<Floorplan floorplan={floorplan} />);

        expect(container).toMatchSnapshot();
    });

    test("renders first floor", () => {
        mocks.useFloor.mockReturnValue("First");

        const { container } = render(<Floorplan floorplan={floorplan} />);

        expect(container).toMatchSnapshot();
    });

    test("renders portrait", () => {
        mocks.useOrientation.mockReturnValue({ isLandscape: false, isPortrait: true });

        const { container } = render(<Floorplan floorplan={floorplan} />);

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
