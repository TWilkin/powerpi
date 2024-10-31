import { Device } from "@powerpi/common-api";
import { fireEvent, render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "react-query";
import CapabilityDialog from "./CapabilityDialog";

test("No capabilities", () => {
    setup({ type: "something" } as Device);

    const button = screen.queryByTitle("Show capability menu");
    expect(button).not.toBeInTheDocument();
});

[
    {
        title: "Brightness",
        capability: { brightness: true },
        brightness: true,
    },
    {
        title: "Colour Temperature",
        capability: { colour: { temperature: { min: 1000, max: 2000 } } },
        temperature: true,
    },
    {
        title: "Colour (both)",
        capability: { colour: { hue: true, saturation: true } },
        colour: true,
    },
    {
        title: "Colour (no saturation)",
        capability: { brightness: true, colour: { hue: true, saturation: false } },
        brightness: true,
        colour: false,
    },
    {
        title: "Stream",
        capability: { streams: ["Radio"] },
        stream: true,
    },
].forEach(({ title, capability, brightness, temperature, colour, stream }) =>
    test(title, () => {
        setup({ type: "something", capability } as Device);

        const button = screen.queryByTitle("Show capability menu");
        expect(button).toBeInTheDocument();

        fireEvent.click(button!);

        let element = screen.queryByTitle("Set the brightness for this device");
        if (brightness) {
            expect(element).toBeInTheDocument();
        } else {
            expect(element).not.toBeInTheDocument();
        }

        element = screen.queryByTitle("Set the colour temperature for this device");
        if (temperature) {
            expect(element).toBeInTheDocument();
        } else {
            expect(element).not.toBeInTheDocument();
        }

        element = screen.queryByTitle("Set the hue for this device");
        if (colour) {
            expect(element).toBeInTheDocument();
        } else {
            expect(element).not.toBeInTheDocument();
        }

        element = screen.queryByTitle("Select the stream for this device to play");
        if (stream) {
            expect(element).toBeInTheDocument();
        } else {
            expect(element).not.toBeInTheDocument();
        }
    }),
);

function setup(device: Device) {
    const queryClient = new QueryClient();

    render(
        <QueryClientProvider client={queryClient}>
            <CapabilityDialog device={device} />
        </QueryClientProvider>,
    );
}
