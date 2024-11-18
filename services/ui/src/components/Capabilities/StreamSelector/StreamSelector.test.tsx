import { Device, DeviceState } from "@powerpi/common-api";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import StreamSelector from "./StreamSelector";

describe("StreamSelector", () => {
    const device: Device = {
        name: "MySpeaker",
        type: "snapcast_client",
        display_name: "My Speaker",
        state: DeviceState.On,
        since: 0,
        visible: true,
        additionalState: {
            stream: "Spotify",
        },
    };

    test("renders", async () => {
        render(
            <StreamSelector
                device={device}
                streams={["Radio", "Spotify", "Music"]}
                disabled={false}
                mutateAsync={vi.fn()}
            />,
        );

        const select = screen.getByRole("combobox");
        expect(select).toBeInTheDocument();

        expect(screen.queryByRole("option")).not.toBeInTheDocument();

        await userEvent.click(select);

        const options = screen.getAllByRole("option");
        expect(options).toHaveLength(3);

        function checkOption(option: HTMLElement, text: string, icon: string) {
            expect(option).toHaveTextContent(text);

            const img = within(option).getByRole("img", { hidden: true });
            expect(img).toBeInTheDocument();
            expect(img).toHaveAttribute("data-icon", icon);
        }

        checkOption(options[0], "Music", "music");
        checkOption(options[1], "Radio", "radio");
        checkOption(options[2], "Spotify", "spotify");
    });

    test("handles change", async () => {
        const mutateAsync = vi.fn();
        render(
            <StreamSelector
                device={device}
                streams={["Radio", "Spotify", "Music"]}
                disabled={false}
                mutateAsync={mutateAsync}
            />,
        );

        const select = screen.getByRole("combobox");
        expect(select).toBeInTheDocument();

        await userEvent.type(select, "r");

        const option = screen.getByRole("option");
        expect(option).toBeInTheDocument();
        expect(option).toHaveTextContent("Radio");

        await userEvent.click(option);

        expect(mutateAsync).toHaveBeenCalledTimes(1);
        expect(mutateAsync).toHaveBeenCalledWith({
            newAdditionalState: { stream: "Radio" },
        });
    });
});
