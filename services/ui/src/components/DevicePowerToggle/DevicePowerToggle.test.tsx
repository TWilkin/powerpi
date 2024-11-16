import { Device, DeviceState } from "@powerpi/common-api";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import DevicePowerToggle from "./DevicePowerToggle";

const mocks = vi.hoisted(() => ({
    useDeviceChangingState: vi.fn(),
    mutateAsync: vi.fn(),
}));

vi.mock("../../queries/notifications", () => ({
    useDeviceChangingState: mocks.useDeviceChangingState,
}));

vi.mock("../../queries/useMutateDeviceState", () => ({
    default: () => ({ mutateAsync: mocks.mutateAsync }),
}));

describe("DevicePowerToggle", () => {
    const device: Device = {
        name: "MyDevice",
        state: DeviceState.On,
        since: 0,
        display_name: "My Device",
        visible: true,
        type: "light",
    };

    beforeAll(() => vi.useFakeTimers({ shouldAdvanceTime: true }));
    afterAll(() => vi.useRealTimers());

    beforeEach(() => {
        vi.resetAllMocks();

        mocks.useDeviceChangingState.mockReturnValue({
            changingState: undefined,
        });
    });

    test("renders", () => {
        render(<DevicePowerToggle device={device} />);

        const input = screen.getByRole("checkbox", { name: "Power My Device off" });
        expect(input).toBeInTheDocument();
        expect(input).toBeChecked();

        const icon = screen.getByRole("img", { hidden: true });
        expect(icon).toBeInTheDocument();
        expect(icon).toHaveAttribute("data-icon", "power-off");
    });

    const loadingStates: { state: boolean | undefined; expectedIcon: "spinner" | "power-off" }[] = [
        { state: true, expectedIcon: "spinner" },
        { state: false, expectedIcon: "power-off" },
        { state: undefined, expectedIcon: "power-off" },
    ];
    test.each(loadingStates)("renders icon when loading=$state", ({ state, expectedIcon }) => {
        mocks.useDeviceChangingState.mockReturnValue({
            changingState: {
                MyDevice: state,
            },
        });

        render(<DevicePowerToggle device={device} />);

        const icon = screen.getByRole("img", { hidden: true });
        expect(icon).toBeInTheDocument();
        expect(icon).toHaveAttribute("data-icon", expectedIcon);
    });

    test("renders buttons", async () => {
        render(<DevicePowerToggle device={device} data-testid="label" />);

        const label = screen.getByTestId("label");
        expect(label).toBeInTheDocument();

        await act(() => longClick(label));

        expect(screen.queryByTestId("label")).not.toBeInTheDocument();
        expect(screen.getAllByRole("button")).toHaveLength(2);
    });

    const cases: {
        label: string;
        state: DeviceState;
        loadingState?: boolean;
        checked: boolean | undefined;
        expectedState: DeviceState;
    }[] = [
        {
            label: "Power My Device on",
            state: DeviceState.Off,
            checked: false,
            expectedState: DeviceState.On,
        },
        {
            label: "Power My Device off",
            state: DeviceState.On,
            checked: true,
            expectedState: DeviceState.Off,
        },
        {
            label: "Power My Device on",
            state: DeviceState.Unknown,
            checked: undefined,
            expectedState: DeviceState.On,
        },
        {
            label: "Power My Device on",
            state: DeviceState.Off,
            loadingState: true,
            checked: false,
            expectedState: DeviceState.Off,
        },
    ];
    test.each(cases)(
        "powers device from $state to $expectedState",
        async ({ label, state, loadingState, checked, expectedState }) => {
            mocks.useDeviceChangingState.mockReturnValue({
                changingState: {
                    MyDevice: loadingState ?? false,
                },
            });

            const localDevice = { ...device, state };
            render(<DevicePowerToggle device={localDevice} />);

            const input = screen.getByRole("checkbox", { name: label });
            expect(input).toBeInTheDocument();

            if (checked === true) {
                expect(input).toBeChecked();
            } else if (checked === false) {
                expect(input).not.toBeChecked();
            } else {
                expect(input).toBePartiallyChecked();
            }

            await userEvent.click(input);
            await vi.runAllTimersAsync();

            expect(mocks.mutateAsync).toHaveBeenCalledTimes(1);
            expect(mocks.mutateAsync).toHaveBeenCalledWith({ newState: expectedState });
        },
    );
});

async function longClick(target: HTMLElement) {
    const user = userEvent.setup();

    await user.pointer({
        keys: "[MouseLeft>]",
        target,
    });

    vi.advanceTimersByTime(1 * 1000);

    await user.pointer({
        keys: "[/MouseLeft]",
        target,
    });
}
