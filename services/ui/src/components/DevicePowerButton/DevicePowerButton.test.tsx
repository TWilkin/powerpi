import { Device, DeviceState } from "@powerpi/common-api";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import DevicePowerButton from "./DevicePowerButton";

const mocks = vi.hoisted(() => ({
    mutateAsync: vi.fn(),
}));

vi.mock("../../queries/useMutateDeviceState", () => ({
    default: () => ({ mutateAsync: mocks.mutateAsync }),
}));

describe("DevicePowerButton", () => {
    const device: Device = {
        name: "MyDevice",
        state: DeviceState.On,
        since: 0,
        display_name: "My Device",
        visible: true,
        type: "light",
    };

    beforeEach(() => vi.resetAllMocks());

    test("renders", () => {
        render(<DevicePowerButton device={device} />);

        const buttons = screen.getAllByRole("button");
        expect(buttons).toHaveLength(2);

        const onButton = screen.getByRole("button", { name: "Power My Device on" });
        expect(onButton).toBeInTheDocument();

        const offButton = screen.getByRole("button", { name: "Power My Device off" });
        expect(offButton).toBeInTheDocument();
    });

    const cases: { type: string; label: string; state: DeviceState }[] = [
        { type: "light", label: "Power My Device on", state: DeviceState.On },
        { type: "light", label: "Power My Device off", state: DeviceState.Off },
        { type: "pairing", label: "Unlock My Device", state: DeviceState.On },
        { type: "pairing", label: "Lock My Device", state: DeviceState.Off },
    ];
    test.each(cases)("powers $type device $state", async ({ type, label, state }) => {
        render(<DevicePowerButton device={{ ...device, type }} />);

        const button = screen.getByRole("button", { name: label });
        expect(button).toBeInTheDocument();

        await userEvent.click(button);

        expect(mocks.mutateAsync).toHaveBeenCalledTimes(1);
        expect(mocks.mutateAsync).toHaveBeenCalledWith({ newState: state });
    });

    test.each(cases)("powers device $state with callback", async ({ type, label }) => {
        const onPowerChange = vi.fn();
        render(<DevicePowerButton device={{ ...device, type }} onPowerChange={onPowerChange} />);

        const button = screen.getByRole("button", { name: label });
        expect(button).toBeInTheDocument();

        await userEvent.click(button);

        expect(mocks.mutateAsync).toHaveBeenCalledTimes(1);
        expect(onPowerChange).toHaveBeenCalledTimes(1);
    });
});
