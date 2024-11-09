import { render, screen } from "@testing-library/react";
import DeviceIcon from "./DeviceIcon";

describe("DeviceIcon", () => {
    const types: { type: string; icon: string }[] = [
        { type: "harmony_hub", icon: "tv" },
        { type: "harmony_activity", icon: "tv" },
        { type: "snapcast_client", icon: "music" },
        { type: "composite", icon: "layer-group" },
        { type: "condition", icon: "greater-than-equal" },
        { type: "computer", icon: "computer" },
        { type: "delay", icon: "stopwatch" },
        { type: "lifx_light", icon: "lightbulb" },
        { type: "mutex", icon: "lock" },
        { type: "zigbee_pairing", icon: "tower-broadcast" },
        { type: "scene", icon: "panorama" },
        { type: "snapcast_server", icon: "server" },
        { type: "energenie_socket", icon: "plug" },
        { type: "energenie_socket_group", icon: "plug" },
        { type: "variable", icon: "code" },
        { type: "something", icon: "question" },
    ];
    test.each(types)("$type has icon $icon", ({ type, icon }) => {
        render(<DeviceIcon type={type} />);

        const image = screen.getByRole("img", { hidden: true });
        expect(image).toBeInTheDocument();
        expect(image).toHaveAttribute("data-icon", icon);
    });
});
