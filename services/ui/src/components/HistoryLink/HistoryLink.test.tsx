import { DeviceState } from "@powerpi/common-api";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import HistoryLink from "./HistoryLink";

describe("HistoryLink", () => {
    test("renders", () => {
        render(
            <HistoryLink
                device={{
                    name: "MyDevice",
                    display_name: "My Device",
                    type: "light",
                    since: -1,
                    state: DeviceState.On,
                    visible: true,
                }}
            />,
            { wrapper: MemoryRouter },
        );

        const link = screen.getByRole("link");
        expect(link).toBeInTheDocument();
        expect(link).toHaveAttribute("href", "/history");
        expect(screen.getByLabelText("Show history for My Device")).toBeInTheDocument();

        const icon = within(link).getByRole("img", { hidden: true });
        expect(icon).toBeInTheDocument();
        expect(icon).toHaveAttribute("data-icon", "clock-rotate-left");
    });
});
