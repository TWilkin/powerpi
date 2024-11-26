import { Device, DeviceState } from "@powerpi/common-api";
import { render, screen, within } from "@testing-library/react";
import { ComponentProps } from "react";
import { vi } from "vitest";
import DevicePowerToggle from "../../DevicePowerToggle";
import BrightnessSlider from "../BrightnessSlider";
import ColourTemperatureSlider from "../ColourTemperatureSlider";
import StreamSelector from "../StreamSelector";
import CapabilityDialogBody from "./CapabilityDialogBody";

const mocks = vi.hoisted(() => ({
    useQueryDevices: vi.fn(),
    useMutateDeviceState: vi.fn(),
}));

vi.mock("../../../queries/useQueryDevices", () => ({
    default: mocks.useQueryDevices,
}));

vi.mock("../../../queries/useMutateDeviceState", () => ({
    default: mocks.useMutateDeviceState,
}));

vi.mock("../../DevicePowerToggle", () => ({
    default: ({ device }: ComponentProps<typeof DevicePowerToggle>) => (
        <div>
            DevicePowerToggle <span>{device.name}</span>
        </div>
    ),
}));
vi.mock("../BrightnessSlider", () => ({
    default: ({ device }: ComponentProps<typeof BrightnessSlider>) => (
        <div>
            BrightnessSlider <span>{device.name}</span>
        </div>
    ),
}));
vi.mock("../ColourTemperatureSlider", () => ({
    default: ({ device }: ComponentProps<typeof ColourTemperatureSlider>) => (
        <div>
            ColourTemperatureSlider <span>{device.name}</span>
        </div>
    ),
}));
vi.mock("../StreamSelector", () => ({
    default: ({ device, streams }: ComponentProps<typeof StreamSelector>) => (
        <div>
            StreamSelector <span>{device.name}</span> <span>{streams}</span>
        </div>
    ),
}));

describe("CapabilityDialogBody", () => {
    const devices: Device[] = [
        {
            name: "ADevice",
            state: DeviceState.Off,
            since: 0,
            display_name: "A Device",
            visible: true,
            type: "socket",
        },
        {
            name: "MyDevice",
            state: DeviceState.On,
            since: 0,
            display_name: "My Device",
            visible: true,
            type: "light",
        },
    ];

    beforeEach(() => {
        mocks.useQueryDevices.mockReturnValue({ data: devices });
        mocks.useMutateDeviceState.mockReturnValue({ isPending: false, mutateAsync: vi.fn() });
    });

    test("renders with capabilities off", () => {
        render(<CapabilityDialogBody deviceName="MyDevice" />);

        const toggle = screen.getByText(/DevicePowerToggle/);
        expect(toggle).toBeInTheDocument();
        expect(within(toggle).getByText("MyDevice")).toBeInTheDocument();

        expect(screen.queryByText(/BrightnessSlider/)).not.toBeInTheDocument();
        expect(screen.queryByText(/ColourTemperatureSlider/)).not.toBeInTheDocument();
        expect(screen.queryByText(/StreamSelector/)).not.toBeInTheDocument();
    });

    test("renders with brightness on", () => {
        mocks.useQueryDevices.mockReturnValue({
            data: [{ ...devices[1], capability: { brightness: true } }],
        });

        render(<CapabilityDialogBody deviceName="MyDevice" />);

        expect(screen.getByText(/DevicePowerToggle/)).toBeInTheDocument();

        const brightness = screen.getByText(/BrightnessSlider/);
        expect(brightness).toBeInTheDocument();
        expect(within(brightness).getByText("MyDevice")).toBeInTheDocument();

        expect(screen.queryByText(/ColourTemperatureSlider/)).not.toBeInTheDocument();
        expect(screen.queryByText(/StreamSelector/)).not.toBeInTheDocument();
    });

    test("renders with colour temperature on", () => {
        mocks.useQueryDevices.mockReturnValue({
            data: [{ ...devices[1], capability: { colour: { temperature: true } } }],
        });

        render(<CapabilityDialogBody deviceName="MyDevice" />);

        expect(screen.getByText(/DevicePowerToggle/)).toBeInTheDocument();

        const temperature = screen.getByText(/ColourTemperatureSlider/);
        expect(temperature).toBeInTheDocument();
        expect(within(temperature).getByText("MyDevice")).toBeInTheDocument();

        expect(screen.queryByText(/BrightnessSlider/)).not.toBeInTheDocument();
        expect(screen.queryByText(/StreamSelector/)).not.toBeInTheDocument();
    });

    test("renders with streams on", () => {
        mocks.useQueryDevices.mockReturnValue({
            data: [{ ...devices[1], capability: { streams: ["Stream1", "Stream2"] } }],
        });

        render(<CapabilityDialogBody deviceName="MyDevice" />);

        expect(screen.getByText(/DevicePowerToggle/)).toBeInTheDocument();

        const streams = screen.getByText(/StreamSelector/);
        expect(streams).toBeInTheDocument();
        expect(within(streams).getByText("MyDevice")).toBeInTheDocument();
        expect(within(streams).getByText(/Stream1/)).toBeInTheDocument();
        expect(within(streams).getByText(/Stream2/)).toBeInTheDocument();

        expect(screen.queryByText(/BrightnessSlider/)).not.toBeInTheDocument();
        expect(screen.queryByText(/ColourTemperatureSlider/)).not.toBeInTheDocument();
    });
});
