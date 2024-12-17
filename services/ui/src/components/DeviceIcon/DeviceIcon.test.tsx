import { render, screen } from "@testing-library/react";
import DeviceIcon from "./DeviceIcon";

describe("DeviceIcon", () => {
    const types: { type: string; expectedIcon: string }[] = [
        { type: "harmony_hub", expectedIcon: "tv" },
        { type: "harmony_activity", expectedIcon: "tv" },
        { type: "snapcast_client", expectedIcon: "music" },
        { type: "composite", expectedIcon: "layer-group" },
        { type: "condition", expectedIcon: "greater-than-equal" },
        { type: "computer", expectedIcon: "computer" },
        { type: "delay", expectedIcon: "stopwatch" },
        { type: "lifx_light", expectedIcon: "lightbulb" },
        { type: "mutex", expectedIcon: "lock" },
        { type: "zigbee_pairing", expectedIcon: "tower-broadcast" },
        { type: "scene", expectedIcon: "panorama" },
        { type: "snapcast_server", expectedIcon: "server" },
        { type: "energenie_socket", expectedIcon: "plug" },
        { type: "energenie_socket_group", expectedIcon: "plug" },
        { type: "variable", expectedIcon: "code" },
        { type: "something", expectedIcon: "question" },
    ];
    test.each(types)("$type has icon $icon", ({ type, expectedIcon }) => {
        render(<DeviceIcon type={type} />);

        const icon = screen.getByRole("img", { hidden: true });
        expect(icon).toBeInTheDocument();
        expect(icon).toHaveAttribute("data-icon", expectedIcon);
    });
});
