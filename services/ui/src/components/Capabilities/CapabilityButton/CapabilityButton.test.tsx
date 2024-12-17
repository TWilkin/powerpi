import { Device, DeviceState } from "@powerpi/common-api";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import CapabilityButton from "./CapabilityButton";

const mocks = vi.hoisted(() => ({
    handleDialogOpen: vi.fn(),
}));

vi.mock("../../Dialog", () => ({
    useDialog: () => ({ handleDialogOpen: mocks.handleDialogOpen }),
}));

describe("CapabilityButton", () => {
    const device: Device = {
        name: "MyDevice",
        state: DeviceState.On,
        since: 0,
        display_name: "My Device",
        visible: true,
        type: "light",
        capability: {
            brightness: true,
        },
    };

    test("renders with capabilities", () => {
        render(<CapabilityButton device={device} />);

        const button = screen.getByRole("button");
        expect(button).toBeInTheDocument();
        expect(button).toHaveAccessibleName("Show capabilities for My Device");

        const icons = within(button).getAllByRole("img", { hidden: true });
        expect(icons).toHaveLength(2);

        expect(icons[0]).toHaveAttribute("data-icon", "lightbulb");
        expect(icons[1]).toHaveAttribute("data-icon", "gear");
    });

    test("renders without capabilities", () => {
        render(<CapabilityButton device={{ ...device, capability: undefined }} />);

        expect(screen.queryByRole("button")).not.toBeInTheDocument();

        const icon = screen.getByRole("img", { hidden: true });
        expect(icon).toBeInTheDocument();
        expect(icon).toHaveAttribute("data-icon", "lightbulb");
    });

    test("opens dialog", async () => {
        const { rerender } = render(<CapabilityButton device={device} />);

        const button = screen.getByRole("button");
        expect(button).toBeInTheDocument();

        await userEvent.click(button);

        expect(mocks.handleDialogOpen).toHaveBeenCalledTimes(1);
        expect(mocks.handleDialogOpen.mock.calls[0][0]).toBe("My Device");

        rerender(mocks.handleDialogOpen.mock.calls[0][1]);
        const icon = screen.getByRole("img", { hidden: true });
        expect(icon).toBeInTheDocument();
        expect(icon).toHaveAttribute("data-icon", "lightbulb");
    });
});
